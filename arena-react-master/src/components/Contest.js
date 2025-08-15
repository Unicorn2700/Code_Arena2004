import React, {useEffect, useState} from 'react';
import {get, getDatabase, onValue, ref, set} from "firebase/database";
import app from "../firebase";
import {useNavigate} from "react-router-dom";
import '../styles/Contest.scoped.css';

const db = getDatabase(app);

function Contest() {

    const navigate = useNavigate();

    const [questions, setQuestions] = useState({});
    const [participantData, setParticipantData] = useState({questions: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]});
    const [sortedScore, setSortedScore] = useState([]);
    const [scoreData, setScoreData] = useState({});
    const [distance, setDistance] = useState(0);
    const [topic, setTopic] = useState('');

    const durationRef = ref(db, "Contest/" + localStorage.getItem("joinContestId") + "/time");
    const questionRef = ref(db, "Contest/" + localStorage.getItem("joinContestId") + "/Questions");
    const participantRef = ref(db, "Contest/" + localStorage.getItem("joinContestId") + "/participants/" + localStorage.getItem('username'))
    const scoresRef = ref(db, "Contest/" + localStorage.getItem("joinContestId") + "/participants/scores")
    const topicRef = ref(db, "Contest/" + localStorage.getItem("joinContestId"))


    useEffect(() => {

        if(localStorage.getItem("submittedTest") === "true"){
            navigate("LeaderBoard");
        }

        get(questionRef).then((snapshot) => {
            setQuestions(snapshot.val());
            console.log(snapshot.val());
        });

        get(participantRef).then((snapshot) => {
            setParticipantData(snapshot.val());
        });

        get(topicRef).then((snapshot) => {
            setTopic(snapshot.val().topic);
        });

        onValue(scoresRef, (snapshot) => {
            setScoreData(snapshot.val());
            const sortedData = Object.entries(snapshot.val()).sort((a, b) => b[1] - a[1]);
            setSortedScore(sortedData);
        });

        onValue(durationRef, (snapshot) => {
            const data = snapshot.val()
            // console.log(data);
            var countDownDate = new Date(data.startAt + data.endAt * 60 * 60 * 1000).getTime();
            startTimer(countDownDate);
        })


    }, []);

    // console.log("sorted scores");
    // console.log(sortedScore);

    function startTimer(countDownDate) {
        let x = setInterval(function () {
            // Get today's date and time
            var now = new Date().getTime();
            // Find the distance between now and the count-down date
            var distance = countDownDate - now;
            setDistance(distance);

            // If the count-down is over, write some text
            if (distance < 0) {
                clearInterval(x);
                set(ref(db, "Contest/" + localStorage.getItem("joinContestId") + "/status"), 2);
                navigate("LeaderBoard");
            }
        }, 1000);
    }

    const handleClicks = (e) => {
        if (e.target.type === 'checkbox') {
            var row = e.target.parentNode.parentNode;
            var cells = row.querySelectorAll('td');
            var queNo = cells[0].textContent-1;
            if (cells[2].querySelector('input').value === "") {
                alert("Please enter answer");
                cells[3].querySelector('input').checked = false;
            } else {
                const ans = cells[2].querySelector('input').value;
                console.log(queNo);
                console.log(ans);
                var temp = participantData;
                temp["questions"][queNo] = ans;
                set(participantRef, temp);
                scoreData[localStorage.getItem('username')] += 1;
                set(ref(db, "Contest/" + localStorage.getItem("joinContestId") + "/participants/scores/" + localStorage.getItem('username')), scoreData[localStorage.getItem('username')]);
                row.querySelector('input').disabled = true;
                cells[3].querySelector('input').disabled = true;
            }
        }
    }

    return (
        <div>
            <div id="timerDiv"
                 style={{
                     textAlign: "center",
                     marginBottom: "5px",
                     height: "100%",
                     borderColor: "black",
                     fontFamily: "Belanosima, sans-serif",
                     fontSize: "1.7rem",
                     padding: "10px",
                     border: "1px solid black",
                     borderBottomRightRadius: "40px",
                     borderBottomLeftRadius: "40px",
                     backgroundColor: "#2f2f2f",
                     color: "white",
                 }}>
                <div>
                    <u>{topic}</u>
                </div>
                {distance > 0 ?
                    (<div
                        id="timer">
                        {Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h :&nbsp;
                        {Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))}m :&nbsp;
                        {Math.floor((distance % (1000 * 60)) / 1000)}s
                    </div>) :
                    (<div> Time End
                    </div>)
                }
            </div>
            <div className="container">
                <div id="contestDiv"
                     style={{
                         marginLeft: "3px",
                         display: "flex",
                         textAlign: "left",
                         width: "60%",
                         height: "90vh",
                         borderColor: "black",
                         // borderStyle: "dotted"
                     }}>
                    <table>
                        <thead>
                        <tr>
                            <th>Que. No.</th>
                            <th>Question</th>
                            <th>Answer</th>
                            <th>Done</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.keys(questions).map((i) => (
                            <tr key={i}>
                                <td>{parseInt(i)+1}</td>
                                <td><a href={questions[i + ""]["queUrl"]}
                                       target="_blank">{questions[i + ""]["queName"]}</a></td>
                                {participantData["questions"][i + ""] !== "" ?
                                    (<>
                                        <td><input type="text" value={participantData["questions"][i + ""]}
                                                   disabled={true}/></td>
                                        <td><input type="checkbox" checked={true} disabled={true}/></td>
                                    </>) :
                                    (<>
                                        <td><input type="text"/></td>
                                        <td><input type="checkbox" onClick={(e) => handleClicks(e)}/></td>
                                    </>)
                                }

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div id="leaderboardDiv"
                     style={{
                         width: "20%",
                         display: "flex",
                         textAlign: "right",
                         height: "90vh",
                         borderColor: "black",
                         // borderStyle: "dotted"
                     }}>

                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.keys(sortedScore).map((i) => (<tr key={i}>
                            <td>{sortedScore[i][0]}</td>
                            <td>{sortedScore[i][1]}</td>
                        </tr>))}
                        </tbody>
                    </table>

                </div>
            </div>

            <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '10px',
            }}>
                <button
                    style={{
                        width: "12%",
                        height: "50px",
                        borderRadius: "10px",
                        backgroundColor: "#2f2f2f",
                        color: "white",
                        fontFamily: "Belanosima, sans-serif",
                        fontSize: "1.2rem",
                        border: "1px solid black",
                        marginLeft: "3px",
                        marginTop: "5px",
                        marginBottom: "5px",
                        textAlign: "center",
                        justifyContent: "center",

                    }}
                    onClick={() => {
                        localStorage.setItem("submittedTest", "true");
                        navigate("LeaderBoard")
                    }}>Submit</button>
            </div>

        </div>
    );
}

export default Contest;