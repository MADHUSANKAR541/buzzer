// src/components/ParticipantsList.js
type Participant = { id: string; name: string };
export default function ParticipantsList({ participants = [] as Participant[] }){
  return (
    <div className="panel participants-panel">
      <h3>Participants</h3>
      <ul>
        {participants.length ? participants.map((p: Participant)=> (
          <li key={p.id}>{p.name}</li>
        )) : <li className="muted">No participants</li>}
      </ul>
    </div>
  );
}
 

