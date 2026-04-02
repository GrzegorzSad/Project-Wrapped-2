import React from 'react';
import { Card } from 'react-bootstrap';

const ScrollableCard = ({children}) => {
  return (
    <Card className='col-md-aut bg-darkerMine' style={{overflow: 'hidden', maxHeight: '76vh', borderRadius: '35px', boxShadow: '0 4px 12px rgba(18, 18, 18, 0.4)'}}> 
      <Card.Body className='custom-scrollbar mt-1'>
        <Card.Text style={{marginTop: '-8px', marginBottom: '-8px', marginLeft:"-4px", marginRight:"-4px"}}>
          {children}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ScrollableCard;
