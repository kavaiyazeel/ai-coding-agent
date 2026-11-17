import json
import urllib.request
import urllib.error


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "qwen2.5-coder:1.5b"


def review_code(code: str):

    prompt = f"""
You are an expert Python code debugging assistant.

Analyze the following Python code:

PYTHON CODE:
{code}

Your job is to:

1. Find syntax errors.
2. Find logical errors.
3. Explain the error.
4. Provide corrected Python code.

IMPORTANT RULES:

- Return ONLY valid JSON.
- Do NOT use Markdown.
- Do NOT use ```json.
- Do NOT add text before or after the JSON.
- The "corrected_code" field MUST contain ONLY Python code.
- Never put explanations inside "corrected_code".
- Never put Markdown inside "corrected_code".
- If the code is already correct, return the original code unchanged in "corrected_code".
- If there is a syntax error, fix the syntax error.
- Make sure the corrected_code is valid Python syntax.

The JSON MUST contain exactly these fields:

{{
    "bug_found": true,
    "bug_type": "syntax",
    "severity": "high",
    "explanation": "Explain the problem here",
    "original_code": "Original Python code",
    "corrected_code": "Corrected Python code only"
}}

Example:

Input Python code:

def add(a, b)
    return a + b

Correct JSON:

{{
    "bug_found": true,
    "bug_type": "syntax",
    "severity": "high",
    "explanation": "The function definition is missing a colon at the end.",
    "original_code": "def add(a, b)\\n    return a + b",
    "corrected_code": "def add(a, b):\\n    return a + b"
}}

Remember:

The corrected_code value must contain executable Python code only.
Do not put the explanation in corrected_code.
Do not say that the code is correct when there is a syntax error.
"""

    data = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=180
        ) as response:

            result = json.load(response)

        response_text = result["response"].strip()

        if response_text.startswith("```"):

            response_text = (
                response_text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        review = json.loads(response_text)

        required_fields = {
            "bug_found",
            "bug_type",
            "severity",
            "explanation",
            "original_code",
            "corrected_code"
        }

        if not isinstance(review, dict):
            raise ValueError(
                "AI review must be a JSON object"
            )

        if not required_fields.issubset(review):
            raise ValueError(
                "AI review is missing required fields"
            )

        if not isinstance(
            review["corrected_code"],
            str
        ):
            raise ValueError(
                "corrected_code must be a string"
            )

        return {
            "ai_review": review
        }

    except urllib.error.URLError as error:

        raise RuntimeError(
            f"Could not connect to Ollama: {error}"
        ) from error

    except json.JSONDecodeError as error:

        raise RuntimeError(
            "Ollama returned invalid JSON"
        ) from error

    except (KeyError, ValueError) as error:

        raise RuntimeError(
            f"Invalid AI review response: {error}"
        ) from error