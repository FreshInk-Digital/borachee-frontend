import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Products.css';
import product_1 from '../../assets/product-1.png';
import product_2 from '../../assets/product-2.png';
import product_3 from '../../assets/product-3.png';
import product_4 from '../../assets/product-4.png';
import product_5 from '../../assets/product-5.png';
import product_6 from '../../assets/product-6.png';
import product_7 from '../../assets/product-7.png';
import product_8 from '../../assets/product-8.png';
import product_9 from '../../assets/product-9.png';
import product_10 from '../../assets/product-10.png';
import product_11 from '../../assets/product-11.png';
import product_12 from '../../assets/product-12.png';
import program_icon_1 from '../../assets/program-icon-1.png';
import program_icon_2 from '../../assets/program-icon-2.png';
import program_icon_3 from '../../assets/program-icon-3.png';

const Programs = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className='programs programs-slider'>
      <Slider {...settings}>
        <div className="program">
          <img src={product_1} alt="Product 1" />
          <div className="caption">
            <h2>Grinding Discs</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_11} alt="Product 11" />
          <div className="caption">
            <h2>Fibre Disc Pad</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_2} alt="Product 2" />
          <div className="caption">
            <h2>Flap Discs</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_3} alt="Product 3" />
          <div className="caption">
            <h2>Cutting Discs</h2>
          </div>
        </div>
        
        <div className="program">
          <img src={product_4} alt="Product 4" />
          <div className="caption">
            <h2>Velcro Pads</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_5} alt="Product 5" />
          <div className="caption">
            <h2>PSA Discs</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_6} alt="Product 6" />
          <div className="caption">
            <h2>Velcro Discs</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_7} alt="Product 7" />
          <div className="caption">
            <h2>PSA Pads</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_8} alt="Product 8" />
          <div className="caption">
            <h2>Diamond Blades</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_9} alt="Product 9" />
          <div className="caption">
            <h2>TCT Saw Blade</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_10} alt="Product 10" />
          <div className="caption">
            <h2>Diamond Cup Wheel</h2>
          </div>
        </div>

        <div className="program">
          <img src={product_12} alt="Product 12" />
          <div className="caption">
            <h2> Wire Cup Brush</h2>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default Programs;
