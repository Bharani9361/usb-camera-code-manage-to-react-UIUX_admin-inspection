import React from 'react';
import useSocket from './useSocket';

const ChildComponent2 = () => {
  const { data } = useSocket();

  return (
    <div>
      <h2>Child Component 2</h2>
      <p>Shared Data: {JSON.stringify(data)}</p>
    </div>
  );
};

export default ChildComponent2;
