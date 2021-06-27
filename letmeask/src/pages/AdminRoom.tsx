import { Link, useHistory, useParams } from 'react-router-dom'

import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';

import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';


import { useTheme } from '../hooks/useTheme';
import '../styles/room.scss';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const { user } = useAuth();
  const history = useHistory()
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const { theme, toggleTheme} = useTheme();

  const { title, questions, authorRoom } = useRoom(roomId)

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    })

    history.push('/');
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    })
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    })
  }

  return (

    <>
      {authorRoom !== user?.id ? (
        <div className='naoADM'>
          <h2>Calma ai!!</h2>
          <p>Você não é o administrador, por favor retorna à <Link to={`/rooms/${roomId}`}>sala</Link></p>
        </div>
      ) : (
        
        <div id="page-room" className={theme}>
          <button id="themeToggler" onClick={toggleTheme}>{theme}</button>
          <header>
            <div className="content">
              <div className="LogoImage">
              <img src={logoImg} alt="Letmeask" />
              </div>
              <Link className='Link' to={`/rooms/${roomId}`}>Retornar à sala</Link>
              <div>
                <RoomCode code={roomId} />
                <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
              </div>
            </div>
          </header>

          <main>
            <div className="room-title">
              <h1 className={theme}>Sala {title}</h1>
              {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
            </div>

            <div className="question-list">
              {questions.map(question => {
                return (
                  <Question
                    key={question.id}
                    content={question.content}
                    author={question.author}
                    isAnswered={question.isAnswered}
                    isHighlighted={question.isHighlighted}
                  >
                    {!question.isAnswered && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCheckQuestionAsAnswered(question.id)}
                        >
                          <img src={checkImg} alt="Marcar pergunta como respondida" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHighlightQuestion(question.id)}
                        >
                          <img src={answerImg} alt="Dar destaque à pergunta" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <img src={deleteImg} alt="Remover pergunta" />
                    </button>
                  </Question>
                );
              })}
            </div>
          </main>
        </div>
      )}
    </>

  );
}