from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import ChatMessage, ChatSession, User
from app.schemas.ai import AIChatRequest, AIChatResponse, AIHistoryResponse
from app.services.ai_assistant import build_ai_reply


router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.get("/history", response_model=AIHistoryResponse)
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .first()
    )
    if not session:
        return AIHistoryResponse(session_id=None, messages=[])
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    return AIHistoryResponse(session_id=session.id, messages=messages)


@router.post("/chat", response_model=AIChatResponse)
def chat(payload: AIChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = None
    if payload.session_id:
        session = db.query(ChatSession).filter(ChatSession.id == payload.session_id, ChatSession.user_id == current_user.id).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")
    if not session:
        session = ChatSession(user_id=current_user.id)
        db.add(session)
        db.commit()
        db.refresh(session)

    user_message = ChatMessage(session_id=session.id, role="user", message=payload.message.strip())
    db.add(user_message)
    db.commit()

    reply = build_ai_reply(db, current_user, payload.message)
    assistant_message = ChatMessage(session_id=session.id, role="assistant", message=reply)
    db.add(assistant_message)
    db.commit()

    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    return AIChatResponse(session_id=session.id, reply=reply, messages=messages)


@router.delete("/history")
def clear_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
    for session in sessions:
        db.delete(session)
    db.commit()
    return {"message": "AI assistant history cleared."}
