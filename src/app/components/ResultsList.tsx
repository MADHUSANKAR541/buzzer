// src/components/ResultsList.js
type Result = { round:number; participantId:string; participantName:string; position:number; timestamp:number };
export default function ResultsList({ results = [] as Result[] }){
  return (
    <div className="panel results-panel">
      <h3>Results</h3>
      <ol className="results-list">
        {results.length ? results.map((r: Result)=>(
          <li key={r.participantId} className="result-item">
            <span className="position">{r.position}.</span>
            <span className="name">{r.participantName}</span>
          </li>
        )) : <li className="muted">No results yet</li>}
      </ol>
    </div>
  );
}
 