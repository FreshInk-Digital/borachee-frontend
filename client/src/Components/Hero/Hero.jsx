import React from 'react'
import './Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'
import { Link } from 'react-scroll'

const Hero = () => {
  return (
    <div className='hero container'>
      <div className="hero-text">
        <h1>Driven by continuous improvement and a commitment to empowering excellence.</h1>
        <p>We specialize in sourcing and distributing reliable, cost-effective power tool 
          accessories, consumables, and spare parts for construction, fabrication, 
          and maintenance applications.
          </p>
        <button className='btn'>
          <Link to='campus' smooth={true} offset={-260} duration={500}>Explore more <img src={dark_arrow} alt='' /></Link> 
        </button>
      </div>
    </div>
  )
}

export default Hero