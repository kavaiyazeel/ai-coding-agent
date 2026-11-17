from typing import TypedDict

from langgraph.graph import StateGraph, END

from .analyzer import check_syntax
from .ai_agent import review_code
from .validator import validate_code


# --------------------------------------------------
# AGENT STATE
# --------------------------------------------------

class AgentState(TypedDict, total=False):
    code: str
    syntax_result: dict
    ai_review: dict
    corrected_code: str
    validation_result: dict


# --------------------------------------------------
# STEP 1: SYNTAX ANALYSIS
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

    # Always review the code using Ollama.
    # Valid syntax does not guarantee correct logic.
    result = review_code(code)

    return {
        "ai_review": result
    }


# --------------------------------------------------
# STEP 3: EXTRACT CORRECTED CODE
# --------------------------------------------------

def generate_fix(state: AgentState):

    ai_result = state.get("ai_review", {})

    corrected_code = ""

    if isinstance(ai_result, dict):

        corrected_code = ai_result.get(
            "corrected_code", ""
        )

        # Handle nested response from ai_agent.py
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

    # No bug found, so no correction is required
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

    # AI did not provide corrected code
    if not corrected_code:
        return {
            "validation_result": {
                "status": "error",
                "message": "No corrected code returned by AI"
            }
        }

    # Check corrected code syntax
    result = validate_code(corrected_code)

    return {
        "validation_result": result
    }


# --------------------------------------------------
# BUILD LANGGRAPH WORKFLOW
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

    # Logical bug test:
    # The function should multiply,
    # but it incorrectly adds the numbers.

    buggy_code = """
def multiply(a, b):
    return a + b

print(multiply(4, 5))
"""

    print("\n==============================")
    print("ORIGINAL CODE:")
    print(buggy_code)

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