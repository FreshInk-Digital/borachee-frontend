import React, { useRef } from 'react'
import './Testimonials.css'
import next_icon from '../../assets/next-icon.png'
import back_icon from '../../assets/back-icon.png'
import brand_1 from '../../assets/brand_1.png'
import brand_2 from '../../assets/brand_2.png'
import brand_3 from '../../assets/brand_3.png'

const Testimonials = () => {

  const slider = useRef();
  let tx = 0;

  const slideForward = ()=>{
    if(tx > -50){
      tx -= 25;
    }
    slider.current.style.transform = `translateX(${tx}%)`;
  }

  const slideBackward = ()=>{
    if(tx < 0){
      tx += 25;
    }
    slider.current.style.transform = `translateX(${tx}%)`;
  }

  return (
    <div className='testimonials'>
      <img src={next_icon} alt="" className='next-btn' onClick={slideForward}/>
      <img src={back_icon} alt="" className='back-btn' onClick={slideBackward}/>

      <div className="slider">
        <ul ref={slider}>
          {/* USER 1 */}
          <li>
            <div className="slide">
              <div className="user-info">
                <img src={brand_1} alt="" />
                <div>
                  <h3>Easyfix</h3>
                  <span>GRINDING WHEEL</span>
                </div>
              </div>
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
              Iusto consectetur mollitia ipsa ex, consequatur ea maxime autem 
              non necessitatibus omnis totam cumque quos voluptate, </p>
            </div>
          </li>

          {/* USER 2 */}
          <li>
            <div className="slide">
              <div className="user-info">
                <img src={brand_2} alt="" />
                <div>
                  <h3>Eurocut</h3>
                  <span>SG-ELASTIC</span>
                </div>
              </div>
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
              Iusto consectetur mollitia ipsa ex, consequatur ea maxime autem 
              non necessitatibus omnis totam cumque quos voluptate, </p>
            </div>
          </li>

          {/* USER 3 */}
          <li>
            <div className="slide">
              <div className="user-info">
                <img src={brand_3} alt="" />
                <div>
                  <h3>SALi</h3>
                  <span>FreshInk, Mby</span>
                </div>
              </div>
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
              Iusto consectetur mollitia ipsa ex, consequatur ea maxime autem 
              non necessitatibus omnis totam cumque quos voluptate, </p>
            </div>
          </li>

          {/* USER 4 */}
          <li>
            <div className="slide">
              <div className="user-info">
                <img src={brand_1} alt="" />
                <div>
                  <h3>Paul Masao</h3>
                  <span>FreshInk, Ash</span>
                </div>
              </div>
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
              Iusto consectetur mollitia ipsa ex, consequatur ea maxime autem 
              non necessitatibus omnis totam cumque quos voluptate, </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Testimonials