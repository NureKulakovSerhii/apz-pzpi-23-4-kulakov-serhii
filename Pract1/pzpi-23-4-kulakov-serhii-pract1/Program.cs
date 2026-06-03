public abstract class State
{
    public abstract void HandleInput(Context editor, string text);
    public abstract void ToggleMode(Context editor);
}

public class Context
{
    private State _currentState;
    public string TextBuffer { get; set; } = "";

    public Context(State initialState)
    {
        TransitionTo(initialState);
    }

    public void TransitionTo(State state)
    {
        _currentState = state;
        Console.WriteLine($"[Система] Перехід до режиму: {state.GetType().Name}");
    }

    public void Type(string text)
    {
        _currentState.HandleInput(this, text);
    }

    public void PressToggle()
    {
        _currentState.ToggleMode(this);
    }
}

public class NormalState : State
{
    public override void HandleInput(Context editor, string text)
    {
        Console.WriteLine($"[Normal] Натиснуто '{text}'. У звичайному режимі введення тексту заблоковано.");
    }

    public override void ToggleMode(Context editor)
    {
        editor.TransitionTo(new InsertState());
    }
}

public class InsertState : State
{
    public override void HandleInput(Context editor, string text)
    {
        editor.TextBuffer += text;
        Console.WriteLine($"[Insert] Додано текст. Поточний буфер: \"{editor.TextBuffer}\"");
    }

    public override void ToggleMode(Context editor)
    {
        editor.TransitionTo(new PreviewState());
    }
}

public class PreviewState : State
{
    public override void HandleInput(Context editor, string text)
    {
        Console.WriteLine("[Preview] Попередження: Режим перегляду! Редагування неможливе.");
    }

    public override void ToggleMode(Context editor)
    {
        editor.TransitionTo(new NormalState());
    }
}