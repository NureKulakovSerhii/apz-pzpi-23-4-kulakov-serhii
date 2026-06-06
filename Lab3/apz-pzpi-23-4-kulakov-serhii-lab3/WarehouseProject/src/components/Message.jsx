import '../styles/Message.css';

function Message({ text, time, sender }) {
    const isUser = sender === "user";
    
    return (
        <div className={`message-wrapper ${isUser ? 'user-wrapper' : 'support-wrapper'}`}>
            <div className={`message ${isUser ? 'user-message' : 'support-message'}`}>
                <div className="message-bubble">
                    <div className="message-text">{text}</div>
                    <div className="message-time">{time}</div>
                </div>
            </div>
        </div>
    );
}

export default Message;