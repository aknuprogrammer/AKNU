import React from "react";
import "./ContactCard.css";
import { MessageCircle } from 'lucide-react';

export default function ContactCard() {
  return (
    <section id="cards">
      <div className="card vc-office">
        <div className="card-content">
          <div className="icon-container">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
            </svg>
          </div>
          <h3>VC'S OFFICE</h3>

          <ul>
            <li>Rajamahendravaram-533296, Andhrapradesh State, India.</li>
            <li>vc@aknu.edu.in</li>
          </ul>
          <div className="message-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3.464 16.828C2 15.657 2 14.771 2 11s0-5.657 1.464-6.828C4.93 3 7.286 3 12 3s7.071 0 8.535 1.172S22 7.229 22 11s0 4.657-1.465 5.828C19.072 18 16.714 18 12 18c-2.51 0-3.8 1.738-6 3v-3.212c-1.094-.163-1.899-.45-2.536-.96"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="card registrar-office">
        <div className="card-content">
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
            >
              <path
                fill="#fff"
                d="M14 15V4h-3V1H2v14H0v1h7v-3h2v3h7v-1zm-8-4H4V9h2zm0-3H4V6h2zm0-3H4V3h2zm3 6H7V9h2zm0-3H7V6h2zm0-3H7V3h2zm4 6h-2V9h2zm0-3h-2V6h2z"
              />
            </svg>
          </div>
          <h3>REGISTRAR'S OFFICE</h3>

          <ul>
            <li>Rajamahendravaram-533296, Andhrapradesh State, India.</li>
            <li>registrar@aknu.edu.in</li>
          </ul>
          <div className="message-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3.464 16.828C2 15.657 2 14.771 2 11s0-5.657 1.464-6.828C4.93 3 7.286 3 12 3s7.071 0 8.535 1.172S22 7.229 22 11s0 4.657-1.465 5.828C19.072 18 16.714 18 12 18c-2.51 0-3.8 1.738-6 3v-3.212c-1.094-.163-1.899-.45-2.536-.96"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="card pg-exams">
        <div className="card-content">
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 48 48"
            >
              <g fill="#fff">
                <path d="M20 15a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1m1 3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2zm-1 10a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1m1 3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z" />
                <path
                  fill-rule="evenodd"
                  d="M10 27a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zm2 1v3h3v-3z"
                  clip-rule="evenodd"
                />
                <path d="M17.707 15.707a1 1 0 0 0-1.414-1.414L13 17.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L13 20.414z" />
                <path
                  fill-rule="evenodd"
                  d="M10 6a4 4 0 0 0-4 4v28a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V10a4 4 0 0 0-4-4zm-2 4a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2zm28 6a3 3 0 1 1 6 0v20.303l-3 4.5l-3-4.5zm3-1a1 1 0 0 0-1 1v2h2v-2a1 1 0 0 0-1-1m0 22.197l-1-1.5V20h2v15.697z"
                  clip-rule="evenodd"
                />
              </g>
            </svg>
          </div>
          <h3>PG EXAMINATIONS</h3>

          <ul>
            <li>Rajamahendravaram-533296, Andhrapradesh State, India.</li>
            <li>0883-2566030</li>
          </ul>
          <div className="message-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3.464 16.828C2 15.657 2 14.771 2 11s0-5.657 1.464-6.828C4.93 3 7.286 3 12 3s7.071 0 8.535 1.172S22 7.229 22 11s0 4.657-1.465 5.828C19.072 18 16.714 18 12 18c-2.51 0-3.8 1.738-6 3v-3.212c-1.094-.163-1.899-.45-2.536-.96"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="card ug-exams">
        <div className="card-content">
          <div className="icon-container">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
            </svg>
          </div>
          <h3>UG EXAMINATIONS</h3>

          <ul>
            <li>Rajamahendravaram-533296, Andhrapradesh State, India.</li>
            <li>0883-2566013</li>
          </ul>
          <div className="message-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3.464 16.828C2 15.657 2 14.771 2 11s0-5.657 1.464-6.828C4.93 3 7.286 3 12 3s7.071 0 8.535 1.172S22 7.229 22 11s0 4.657-1.465 5.828C19.072 18 16.714 18 12 18c-2.51 0-3.8 1.738-6 3v-3.212c-1.094-.163-1.899-.45-2.536-.96"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
