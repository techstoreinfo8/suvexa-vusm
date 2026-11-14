import "./App.css";
import { useState } from "react";

import { Palette, Image, Video, Share2 } from "lucide-react";

import {
  Code2,
  Smartphone,
  Cloud,
  BrainCircuit,
  Database,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const services = [
    {
      icon: <Code2 size={32} />,
      title: "Software Development",
      text: "Scalable and reliable software solutions designed around your business needs.",
    },
    {
      icon: <Code2 size={32} />,
      title: "Web Development",
      text: "Modern, responsive and high-performance websites and web applications.",
    },
    {
      icon: <Smartphone size={32} />,
      title: "Mobile Applications",
      text: "User-friendly mobile applications for Android and iOS platforms.",
    },
    {
      icon: <Cloud size={32} />,
      title: "Cloud Solutions",
      text: "Secure and scalable cloud solutions to modernize your business.",
    },
    {
      icon: <BrainCircuit size={32} />,
      title: "AI & Automation",
      text: "Intelligent automation solutions that improve productivity and efficiency.",
    },
    {
      icon: <Database size={32} />,
      title: "Data Solutions",
      text: "Reliable database, analytics and data management solutions.",
    },
  ];

  const technologies = [
    "React",
    "Java",
    "Spring Boot",
    "Node.js",
    "MySQL",
    "MongoDB",
    "AWS",
    "Docker",
  ];

  // Contact form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit contact enquiry
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setFeedback("");
    setFeedbackType("");

    try {


      const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
      console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
      if (!API_URL) {
        throw new Error("Backend API URL is not configured.");
      }

      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.company.trim(),
          message: formData.message.trim(),
        }),
      });



      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to submit your enquiry."
        );
      }

      setFeedback(
        result.message ||
        "Thank you for contacting Suvexa VUSM Technologies! Your message has been submitted successfully."
      );

      setFeedbackType("success");

      // Clear all form fields after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    } catch (error) {
      setFeedback(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check that your backend is running."
          : error.message || "Something went wrong. Please try again."
      );

      setFeedbackType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const healthcareServices = [
    {
      title: "Medical Branding",
      text: "Professional logo design and brand identity solutions for clinics, hospitals and healthcare professionals.",
      icon: <Palette size={28} />
    },
    {
      title: "Healthcare Graphics",
      text: "Creative posters, brochures and promotional designs for healthcare businesses.",
      icon: <Image size={28} />
    },
    {
      title: "Promotional Videos",
      text: "Engaging promotional videos and visual content for clinics and medical professionals.",
      icon: <Video size={28} />
    },
    {
      title: "Social Media & Digital Marketing",
      text: "Creative social media content and digital promotion to strengthen healthcare brand visibility.",
      icon: <Share2 size={28} />
    }
  ];

  return (
    <div className="app">
      {/* Navbar */}

      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <div className="logo-mark">S</div>
          <div>
            <h2>Suvexa VUSM</h2>
            <span>Technologies</span>
          </div>
        </div>


        <nav
          id="mobile-navigation"
          className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}
        >
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>
            Home
          </a>

          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            About Us
          </a>

          <a href="#services" onClick={() => setMobileMenuOpen(false)}>
            Services
          </a>

          <a href="#technology" onClick={() => setMobileMenuOpen(false)}>
            Technology
          </a>

          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
            GET IN TOUCH
          </a>
        </nav>


        <a className="nav-button" href="#contact">
          GET IN TOUCH
        </a>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <span>{mobileMenuOpen ? "✕" : "☰"}</span>
        </button>
      </header>


      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-content">
          <span className="badge">
            NEXT-GENERATION TECHNOLOGY & CREATIVITY
          </span>

          <h1>
            Building Digital
            <span> Experiences</span>
            <br />
            That Move Business Forward.
          </h1>

          <p className="large-text">
            Suvexa VUSM Technologies combines innovative software development with creative healthcare solutions to help businesses build their digital presence, connect with customers and grow smarter.
          </p>

          <div className="hero-buttons">
            <a href="#services" className="primary-button">
              Explore Services <ArrowRight size={19} />
            </a>

            <a href="#contact" className="secondary-button">
              Contact Us
            </a>
          </div>
        </div>

        <div className="hero-card">
          <div className="orb"></div>
          <div className="hero-logo">S</div>
          <h3>Suvexa VUSM</h3>
          <p>Innovate. Build. Transform.</p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section about">
        <div className="section-heading">
          <span>ABOUT US</span>
          <h2>Technology With Purpose</h2>
        </div>

        <div className="about-grid">
          <div>
            <p className="large-text">
              Suvexa VUSM Technologies is a digital solutions company focused on helping businesses grow through innovative technology and creative digital services.
            </p>

            <p className="large-text">
              We bring together software development, modern digital experiences and healthcare-focused creative solutions to help businesses strengthen their online presence, connect with their audiences and move forward with confidence.
            </p>
          </div>

          <div className="about-box">
            <ShieldCheck size={42} />
            <h3>Our Mission</h3>
            <p>
              To empower businesses with reliable technology, meaningful creativity and innovative digital solutions that create lasting value.
            </p>
          </div>
          <div className="about-box">
            <ShieldCheck size={42} />
            <h3>Our Vision</h3>
            <p>
              To become a trusted digital solutions partner, delivering technology and creative services that make a meaningful difference for businesses.            </p>
          </div>
          <div className="about-box">
            <ShieldCheck size={42} />
            <h3>What We Do</h3>
            <p>Technology & Software Solutions</p>
            <br />
            <p>Healthcare Creative & Digital Solutions</p>
          </div>
        </div>
      </section>

      {/* Services */}

      {/* Services */}
      <section id="services" className="section services">
        <div className="section-heading center">
          <span>WHAT WE DO</span>
          <h2>Our Digital Solutions</h2>
          <p>
            Technology and creative services designed to help businesses
            grow, innovate and build a stronger digital presence.
          </p>
        </div>

        {/* Division 01 - Technology */}
        <div className="division-heading">
          <span>Technology & Software Solutions</span>
          <p>
            Innovative software and digital solutions designed
            to move your business forward.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">
                {service.icon}
              </div>

              <h3>{service.title}</h3>
              <p>{service.text}</p>

              <a href="#contact">
                Learn More <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Division 02 - Healthcare */}
        <div className="division-heading healthcare-heading">
          <span>Healthcare Creative & Digital Solutions</span>
          <p>
            Creative branding and digital communication solutions
            for healthcare professionals and clinics.
          </p>
        </div>

        <div className="service-grid">
          {healthcareServices.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">
                {service.icon}
              </div>

              <h3>{service.title}</h3>
              <p>{service.text}</p>

              <a href="#contact">
                Learn More <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="why-section">
        <div className="why-content">
          <span>WHY SUVEXA VUSM</span>
          <h2>Solutions Built Around Your Business</h2>

          <p>
            We combine technical expertise and creative thinking
            to deliver practical digital solutions that create
            lasting business value.
          </p>

          <div className="check-list">
            <div>
              <CheckCircle2 />
              <span>Modern technology and creative expertise</span>
            </div>

            <div>
              <CheckCircle2 />
              <span>Business-focused solutions</span>
            </div>

            <div>
              <CheckCircle2 />
              <span>Scalable and reliable services</span>
            </div>

            <div>
              <CheckCircle2 />
              <span>Customer-focused approach</span>
            </div>
          </div>
        </div>
      </section>


      {/* Technologies */}
      <section id="technology" className="section technology">
        <div className="section-heading center">
          <span>OUR TECHNOLOGY STACK</span>
          <h2>Engineering Modern Software & Intelligent AI Solutions</h2>
          <p>
            We leverage modern technologies, cloud platforms and
            Generative AI frameworks to build scalable, secure
            and intelligent digital solutions.
          </p>
        </div>

        <div className="technology-grid">

          {/* 01. Software Development */}
          <div className="technology-category">
            <span className="technology-number">Software Development</span>

            <div className="technology-items">
              {[
                "React",
                "Angular",
                "HTML5",
                "CSS3",
                "Java",
                "Spring Boot",
                "Microservices Architecture",
                "Node.js"
              ].map((item) => (
                <div className="technology-card" key={item}>
                  {item}
                </div>
              ))}
            </div>

          </div>

          {/* 02. Database & Cloud */}
          <div className="technology-category">
            <span className="technology-number">Database & Cloud</span>
            <div className="technology-items">
              {["MySQL", "MongoDB", "AWS", "Docker"].map((item) => (
                <div className="technology-card" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* 03. AI & Generative AI */}
          <div className="technology-category">
            <span className="technology-number">AI & Generative AI</span>
            <div className="technology-items">
              {[
                "Python",
                "LLMs",
                "Prompt Engineering",
                "RAG",
                "Vector Databases",
                "LangChain",
                "Hugging Face",
                "AI API Integration"
              ].map((item) => (
                <div className="technology-card" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* Contact */}
      <section id="contact" className="section contact">
        <div className="section-heading">
          <span>CONTACT US</span>
          <h2>GET IN TOUCH</h2>
        </div>

        <div className="contact-grid">
          {/* Company contact details - left side */}
          <div className="contact-info">
            <div className="contact-item">
              <Mail />

              <div>
                <small>Email</small>
                <p>
                  <a href="mailto:info@suvexavusm.com">
                    info@suvexavusm.com
                  </a>
                  <br />
                  <a href="mailto:infosuvexavusm@gmail.com">
                    infosuvexavusm@gmail.com
                  </a>

                </p>
              </div>

            </div>

            {/*
<div className="contact-item">
  <Phone />
  <div>
    <small>Phone</small>
    <p>+91 99999 99999</p>
  </div>
</div>
*/}

            <div className="contact-item">
              <MapPin />
              <div>
                <small>Location</small>
                <p>HSR Layout, Bengaluru, Karnataka – 560100, India</p>
              </div>
            </div>
          </div>

          {/* Customer enquiry form - right side */}
          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              autoComplete="name"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={254}
              autoComplete="email"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={handleChange}
              maxLength={20}
              autoComplete="tel"
            />

            <input
              type="text"
              name="company"
              placeholder="Company Name (Optional)"
              value={formData.company}
              onChange={handleChange}
              maxLength={200}
              autoComplete="organization"
            />

            <textarea
              name="message"
              rows={5}
              placeholder="Tell us about your project"
              value={formData.message}
              onChange={handleChange}
              required
              maxLength={5000}
            />

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Message"}

              {!submitting && <ArrowRight size={18} />}
            </button>

            {feedback && (
              <p
                className={`form-feedback ${feedbackType}`}
                role="status"
                aria-live="polite"
              >
                {feedback}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>
          <h3>Suvexa VUSM Technologies</h3>
          <p>Innovate. Build. Transform.</p>
        </div>

        <div className="footer-links">
          <a href="/#home">Home</a>
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/#technology">Technology</a>
          <a href="/#contact">Contact</a>
        </div>

        <p className="copyright">
          © 2026 Suvexa VUSM Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;