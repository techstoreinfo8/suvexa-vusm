// import { useEffect, useRef, useState } from "react";
// import emailjs from "@emailjs/browser";

// function Contact() {
//   const form = useRef();
//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     emailjs.init({
//       publicKey: "nIzQ1VGsfIGE4nTj-",
//     });

//     console.log("EmailJS initialized");
//   }, []);

//   const sendEmail = async (e) => {
//     e.preventDefault();

//     console.log("1. SEND BUTTON CLICKED");
//     setStatus("Sending...");

//     try {
//       console.log("2. Calling EmailJS...");

//       const result = await emailjs.sendForm(
//         "service_58wc73o",
//         "template_ycbddvy",
//         form.current
//       );

//       console.log("3. EMAILJS SUCCESS:", result);

//       setStatus("Email sent successfully!");

//       form.current.reset();
//     } catch (error) {
//       console.error("4. EMAILJS ERROR:", error);

//       setStatus(
//         "Email failed: " +
//           (error?.text ||
//             error?.message ||
//             error?.toString() ||
//             "Unknown error")
//       );
//     }
//   };

//   return (
//     <section
//       id="contact"
//       style={{
//         padding: "80px 7%",
//         background: "#f7f9fc",
//       }}
//     >
//       <h2>Contact Suvexa VUSM Technologies</h2>

//       <p>
//         Send us your requirement and our team will contact you.
//       </p>

//       <form
//         ref={form}
//         onSubmit={sendEmail}
//         style={{
//           maxWidth: "700px",
//           marginTop: "30px",
//           display: "grid",
//           gap: "15px",
//         }}
//       >
//         <input
//           type="text"
//           name="from_name"
//           placeholder="Your Name"
//           required
//         />

//         <input
//           type="email"
//           name="from_email"
//           placeholder="Email Address"
//           required
//         />

//         <input
//           type="tel"
//           name="phone"
//           placeholder="Phone Number"
//           required
//         />

//         <input
//           type="text"
//           name="company"
//           placeholder="Company Name"
//         />

//         <input
//           type="text"
//           name="subject"
//           placeholder="Subject"
//           required
//         />

//         <textarea
//           name="message"
//           placeholder="Complete Project Requirement"
//           rows="7"
//           required
//         />

//         <button
//           type="submit"
//           style={{
//             padding: "14px 22px",
//             background: "#155eef",
//             color: "white",
//             border: "none",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontWeight: "600",
//           }}
//         >
//           Send Message
//         </button>

//         {status && (
//           <div
//             style={{
//               padding: "15px",
//               background: "white",
//               borderRadius: "8px",
//               border: "1px solid #ddd",
//               fontWeight: "600",
//             }}
//           >
//             {status}
//           </div>
//         )}
//       </form>
//     </section>
//   );
// }

// export default Contact;