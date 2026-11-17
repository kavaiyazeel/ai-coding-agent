from typing import TypedDict

from langgraph.graph import StateGraph, END

from .analyzer import check_syntax
from .ai_agent import review_code
from .validator import validate_code


class AgentState(TypedDict, total=False):
    code: str
    syntax_result: dict
    ai_review: dict
    corrected_code: str
    validation_result: dict


# --------------------------------------------------
# STEP 1: CHECK SYNTAX
# --------------------------------------------------

def syntax_analysis(state: AgentState):

    code = state["code"]

    result = check_syntax(code)

    return {
        "syntax_result": result
    }


# --------------------------------------------------
# STEP 2: AI BUG DETECTION
# --------------------------------------------------

def ai_bug_detection(state: AgentState):

    code = state["code"]

    # Always send code to Ollama for AI analysis.
    # Valid syntax does not mean the code has no bugs.
    result = review_code(code)

    return {
        "ai_review": result
    }


# --------------------------------------------------
# STEP 3: GENERATE / EXTRACT FIX
# --------------------------------------------------

def generate_fix(state: AgentState):

    ai_result = state["ai_review"]

    corrected_code = ""

    if isinstance(ai_result, dict):

        # Support direct AI response
        corrected_code = ai_result.get(
            "corrected_code", ""
        )

        # Support nested AI response
        if not corrected_code:

            nested = ai_result.get("ai_review", {})

            if isinstance(nested, dict):
                corrected_code = nested.get(
                    "corrected_code", ""
                )

    return {
        "corrected_code": corrected_code
    }


# --------------------------------------------------
# STEP 4: VALIDATE CORRECTED CODE
# --------------------------------------------------

def validate_fix(state: AgentState):

    corrected_code = state.get("corrected_code", "")
    ai_result = state.get("ai_review", {})

    # Handle nested AI response
    if isinstance(ai_result, dict):
        review = ai_result.get("ai_review", ai_result)
    else:
        review = {}

    # No bug detected and no correction needed
    if (
        isinstance(review, dict)
        and review.get("bug_found") is False
        and not corrected_code
    ):
        return {
            "validation_result": {
                "status": "not_required",
                "message": "No correction required"
            }
        }

    # AI did not return corrected code
    if not corrected_code:
        return {
            "validation_result": {
                "status": "error",
                "message": "No corrected code was returned by AI"
            }
        }

    # Validate corrected code using AST
    result = validate_code(corrected_code)

    return {
        "validation_result": result
    }


# --------------------------------------------------
# BUILD LANGGRAPH
# --------------------------------------------------

def build_agent_graph():

    graph = StateGraph(AgentState)

    graph.add_node(
        "syntax_analysis",
        syntax_analysis
    )

    graph.add_node(
        "ai_bug_detection",
        ai_bug_detection
    )

    graph.add_node(
        "generate_fix",
        generate_fix
    )

    graph.add_node(
        "validate_fix",
        validate_fix
    )

    graph.set_entry_point("syntax_analysis")

    graph.add_edge(
        "syntax_analysis",
        "ai_bug_detection"
    )

    graph.add_edge(
        "ai_bug_detection",
        "generate_fix"
    )

    graph.add_edge(
        "generate_fix",
        "validate_fix"
    )

    graph.add_edge(
        "validate_fix",
        END
    )

    return graph.compile()


# --------------------------------------------------
# RUN AGENT
# --------------------------------------------------

agent = build_agent_graph()


def run_agent(code: str):

    result = agent.invoke({
        "code": code
    })

    return result


# --------------------------------------------------
# LOCAL TEST
# --------------------------------------------------

if __name__ == "__main__":

    buggy_code = """
def add(a, b):
    return a - b

print(add(5, 3))
"""

    result = run_agent(buggy_code)

    print("\n==============================")
    print("SYNTAX RESULT:")
    print(result.get("syntax_result"))

    print("\n==============================")
    print("AI REVIEW:")
    print(result.get("ai_review"))

    print("\n==============================")
    print("CORRECTED CODE:")
    print(result.get("corrected_code"))

    print("\n==============================")
    print("VALIDATION RESULT:")
    print(result.get("validation_result"))

    print("\n==============================")
    print("AGENT GRAPH FINISHED")
    print("==============================")