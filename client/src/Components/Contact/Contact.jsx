import axios from "axios";
import React, { useState } from 'react';
import './Contact.css';
import msg_icon from '../../assets/msg-icon.png';
import mail_icon from '../../assets/mail-ico.png';
import phone_icon from '../../assets/phone-ico.png';
import location_icon from '../../assets/location-ico.png';
import insta_icon from '../../assets/insta-ico.png';
import whatsapp_icon from '../../assets/whatsapp-ico.png';
import white_arrow from '../../assets/white-arrow.png';

const Contact = () => {

  const formInitialDetails = {
    name: "",
    email: "",
    phone: "",
    message: "",
  };

  const [formDetails, setFormDetails] = useState(formInitialDetails);
  const [buttonText, setButtonText] = useState("Send Now");
  const [status, setStatus] = useState({});

  const onFormUpdate = (category, value) => {
    setFormDetails({
      ...formDetails,
      [category]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonText("Sending...");
    
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://borachee.co.tz' : 'http://localhost:3001';
    try {
      let response = await fetch(`https://server.borachee.co.tz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(formDetails)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      let result = await response.json();

      if(result.code === 200) {
        setStatus({ success: true, message: "Message sent successfully"});
      } else {
        setStatus({ success: false, message: "Message sent successfully"})
      }
    } catch (error) {
      setStatus({ success: false, message: "Message sent successfully" });
    } finally {
      setButtonText("Send Now");
      setFormDetails(formInitialDetails);
    }
  };


  
  // const handleSubmit = (e) => {
  //   e.preventDefault();


  //   axios.post("http://localhost:4000", formDetails)
  //   .then((result) => {
  //     console.log("File sent successfully");
  //   })
  //   .catch((err) => {
  //     console.log(err.message)
  //   });


  // };


  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setButtonText("Sending...");
    
  //   const baseUrl = process.env.NODE_ENV === 'production' ? 'https://borachee.co.tz' : 'http://localhost:3001';
  //   try {
  //     let response = await fetch(`${baseUrl}/api/contact`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json;charset=utf-8"
  //       },
  //       body: JSON.stringify(formDetails)
  //     });

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     let result = await response.json();

  //     if(result.code === 200) {
  //       setStatus({ success: true, message: "Message sent successfully"});
  //     } else {
  //       setStatus({ success: false, message: "Something went wrong, Please send again later!"})
  //     }
  //   } catch (error) {
  //     setStatus({ success: false, message: "Something went wrong, Please try again later!" });
  //   } finally {
  //     setButtonText("Send Now");
  //     setFormDetails(formInitialDetails);
  //   }
  // };

  return (
    <div className="contact">
      <div className="contact-col">
        <h3>Send us a message <img src={msg_icon} alt="" /></h3>
        <p>Feel free to reach out through contact form or find our contact information
        below. Your feedback, questions, and suggestions are important to us as We
        strive to provide exceptional service to our Customers.</p>
        <ul>
          <li>
            <a href="mailto:sales@borachee.co.tz" target='_blank'>    
              <img src={mail_icon} alt="" />sales@borachee.co.tz
            </a>
          </li>
          <li><img src={phone_icon} alt="" />+255 767 876 503</li>
          <li>
            <a href="https://wa.link/ba03zv" target='_blank'>
              <img src={whatsapp_icon} alt="" />+255 767 876 503
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/borachee_tz/" target='_blank'>
              <img src={insta_icon} alt="" /> @borachee_tz
            </a>
          </li>
          <li><img src={location_icon} alt="" />Plot 68, Mbezi beach, Tangi bovu<br/>
          Dar es salaam, Tanzania 
          </li>
          <li>
            <img src={location_icon} alt="" />Branch Office Mbeya Sales Office Tunduma Road, Ilomba Mbeya<br/>
            Mbeya, Tanzania - Mobile: 0658199566
          </li>
        </ul>
      </div>
      <div className="contact-col">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={formDetails.name}
            placeholder='Enter Your Full Name'
            onChange={(e) => onFormUpdate("name", e.target.value)}
            required
          />
          <input
            type="email"
            value={formDetails.email}
            placeholder='Enter Your Email Address'
            onChange={(e) => onFormUpdate("email", e.target.value)}
            required
          />
          <input
            type="tel"
            value={formDetails.phone}
            placeholder='Enter Your Phone Number'
            onChange={(e) => onFormUpdate("phone", e.target.value)}
            required
          />
          <textarea
            rows="6"
            value={formDetails.message}
            placeholder='Enter Your Message'
            onChange={(e) => onFormUpdate("message", e.target.value)}
            required
          ></textarea>
          <button
            type='submit'
            className='btn dark-btn'
          >
            {buttonText} 
            <img src={white_arrow} alt="" />
          </button>
          {status.message && (
            <div className="row">
              <p className={status.success === false ? "danger" : "success"}>
                {status.message}
              </p>
            </div>
          )}
        </form>
        <span></span>
      </div>
    </div>
  )
}

export default Contact;
