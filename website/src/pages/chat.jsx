import React, { useState } from "react";
import { BackButton } from "../components/BackButton";

const studentAmbassadors = [
  {
    id: 1,
    name: "Anjali Sharma",
    course: "B.Tech CSE",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Happy to share my GITAM experience with you!",
    isOnline: true,
  },
  {
    id: 2,
    name: "Rohan Mehta",
    course: "BBA",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    bio: "Ask me anything about life at GITAM.",
    isOnline: false,
  },
];

export default function ChatWithStudent() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      setMessages([...messages, { from: "user", text: message }]);
      setMessage("");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10">
        Chat With a Student Ambassador
      </h1>
      <BackButton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Student list */}
        <div className="space-y-6">
          {studentAmbassadors.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:shadow-xl transition rounded-lg bg-white shadow"
            >
              <img
                src={student.image}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{student.name}</h2>
                <p className="text-sm text-gray-500">{student.course}</p>
                <p className="text-sm mt-1">{student.bio}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    student.isOnline
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {student.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div>
          {selectedStudent ? (
            <div className="p-4 h-full flex flex-col rounded-lg bg-white shadow">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedStudent.image}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedStudent.course}
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-96">
                {messages.length === 0 && (
                  <p className="text-gray-400 italic">No messages yet.</p>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg max-w-xs ${
                      msg.from === "user"
                        ? "bg-blue-100 ml-auto"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="border rounded px-3 py-2 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-20">
              Select a student ambassador to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
