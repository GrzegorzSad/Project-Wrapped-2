import React, { useState, useEffect } from "react";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";
import { FreeMode, Scrollbar } from "swiper/modules";

const VerticalRangeSlider = ({ value, onChange }) => {
  const min = 10;
  const max = 300;
  const step = 10; // Define steps for the slider

  // Generate the selectable values
  const values = Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step);

  // Sync Swiper with external state
  const [swiperIndex, setSwiperIndex] = useState(values.indexOf(value));

  useEffect(() => {
    setSwiperIndex(values.indexOf(value));
  }, [value]);

  return (
    <div
      className="slider-container"
      style={{
        width: "100px",
        height: "300px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Swiper
        direction="vertical"
        slidesPerView={3}
        spaceBetween={10}
        freeMode={true}
        scrollbar={{ draggable: true }}
        modules={[FreeMode, Scrollbar]}
        onSlideChange={(swiper) => onChange(values[swiper.activeIndex])}
        initialSlide={swiperIndex}
        style={{
          width: "80px",
          height: "250px",
        }}
      >
        {values.map((val) => (
          <SwiperSlide key={val}>
            <div
              style={{
                textAlign: "center",
                padding: "10px",
                background: value === val ? "#007bff" : "#f8f9fa",
                color: value === val ? "#fff" : "#000",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              {val}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default VerticalRangeSlider;