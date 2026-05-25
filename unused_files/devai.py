import subprocess
import os
from rich import print

PROJECT_DIR = "output_project"

os.makedirs(PROJECT_DIR, exist_ok=True)

def ask_gemini(prompt):
    try:
        result = subprocess.run(
            ["gemini", "chat", prompt],
            capture_output=True,
            text=True
        )
        return result.stdout
    except Exception as e:
        return str(e)

def ask_ollama(prompt):
    result = subprocess.run(
        ["ollama", "run", "deepseek-coder", prompt],
        capture_output=True,
        text=True
    )
    return result.stdout

def save_file(filename, content):
    path = os.path.join(PROJECT_DIR, filename)
    with open(path, "w") as f:
        f.write(content)

def main():
    user_input = input("\n[bold green]Enter project idea:[/bold green] ")

    print("\n[cyan]Planning with Gemini...[/cyan]")
    plan = ask_gemini(f"Break this into dev steps:\n{user_input}")
    print(plan)

    steps = [s for s in plan.split("\n") if s.strip()]

    for i, step in enumerate(steps):
        print(f"\n[yellow]Executing:[/yellow] {step}")

        code = ask_ollama(f"""
        You are a senior developer.
        Task: {step}
        Generate production-ready code.
        Include file name at top like: // filename: app.js
        """)

        print(code[:500])

        # extract filename (simple logic)
        lines = code.split("\n")
        filename = f"file_{i}.txt"

        for l in lines:
            if "filename:" in l.lower():
                filename = l.split(":")[-1].strip()
                break

        save_file(filename, code)

    print("\n[green]Project generated in /output_project[/green]")

if __name__ == "__main__":
    main()
