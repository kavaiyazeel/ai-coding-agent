import ast


def validate_code(code: str):
    try:
        ast.parse(code)

        return {
            "status": "success",
            "message": "Code is valid Python syntax"
        }

    except SyntaxError as e:
        return {
            "status": "error",
            "message": e.msg,
            "line": e.lineno,
            "column": e.offset
        }