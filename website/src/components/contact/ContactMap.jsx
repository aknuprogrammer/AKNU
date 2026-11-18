import { RefreshCw } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ContactMap() {
  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const [captcha, setCaptcha] = React.useState(generateCaptcha());
  const [input, setInput] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleInputChange = (e) => setInput(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePhoneChange = (e) => setPhone(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    const isValid = input === captcha;
    setVerified(isValid);
    if (isValid) {
      alert(
        "Form submitted successfully!\n" +
          JSON.stringify({ name, email, phone, message }, null, 2)
      );
      navigate("/")
    } else {
      alert("Captcha incorrect. Please try again.");
      setCaptcha(generateCaptcha());
      setInput("");
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-stretch gap-8 p-4 w-full max-w-screen-xl mx-auto">
      {/* Map */}
      <iframe
        title="Adikavi Nannaya University Location"
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d30513.156839760744!2d81.872593!3d17.065578!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a379f65b4c51a99%3A0xe010b64ff27f5ab1!2sAdikavi%20Nannaya%20University!5e0!3m2!1sen!2sin!4v1748252036263!5m2!1sen!2sin"
        className="w-[48%] h-[450px] max-w-full border-0 rounded-lg shadow-lg"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      {/* Form Section */}
      <section className="bg-gray-100 border border-gray-300 rounded-lg p-6 w-[48%] h-[450px] max-w-full shadow-lg flex flex-col justify-between">
        <div>
          <div className="text-center mb-4">
            <h4 className="text-xl font-medium text-teal-700 mb-1">
              Get in Touch
            </h4>
            <p className="text-sm text-gray-600">
              Please submit your query. Our executive team will contact you
              soon.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleVerify}>
            <input
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={handleNameChange}
              className="w-full p-3 border border-gray-400 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={handleEmailChange}
              className="w-full p-3 border border-gray-400 rounded"
            />
            <input
              type="number"
              placeholder="Phone"
              required
              value={phone}
              onChange={handlePhoneChange}
              className="w-full p-3 border border-gray-400 rounded"
            />
            <textarea
              placeholder="Message"
              required
              value={message}
              onChange={handleMessageChange}
              className="w-full p-3 border border-gray-400 rounded h-20 resize-none"
            ></textarea>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold tracking-widest px-3 py-2 border border-gray-400 rounded bg-gray-200">
                {captcha}
              </span>
              <button
                type="button"
                onClick={() => setCaptcha(generateCaptcha())}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                aria-label="Refresh Captcha"
              >
                <RefreshCw size={20} stroke="#4887ae" />
              </button>
              <input
                type="text"
                placeholder="Enter captcha"
                value={input}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-400 rounded w-[150px]"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Submit
              </button>
            </div>

            {verified && (
              <div className="text-green-600 text-center font-medium">
                Verified!
              </div>
            )}
            {!verified && input && input !== captcha && (
              <div className="text-red-500 text-center">Captcha incorrect</div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
