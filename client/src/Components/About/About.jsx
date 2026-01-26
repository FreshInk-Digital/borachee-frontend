import React from 'react'
import './About.css'
import about_img from '../../assets/About.png'

const About = () => {
  return (
    <div className="about">
      <div className="about-left">
        <img src={about_img} alt="about image" className='about-img' />
      </div>
      
      <div className="about-right">
        <h3>ABOUT BORACHEE</h3>
        <h2></h2>
        <p>
          We aim to empower craftsmen, technicians, and industries in Tanzania by 
          enhancing the value of their work through the use of the right skills, 
          tools, and technologies.
        </p>
        <p>
          We invest our resources, expertise, and time in sourcing high-quality 
          power tool accessories, consumables, and spare parts, ensuring they 
          remain accessible and affordable to those who depend on them.
        </p>
        <p>
          Through strategic partnerships with global manufacturers, we enable our 
          resellers and customers to access reliable, up-to-date technologies for cutting, 
          grinding, sanding, polishing, and other material finishing applications.
        </p>
      </div>
    </div>
  )
}

export default About