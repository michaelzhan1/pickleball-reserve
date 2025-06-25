import { useEffect, useState } from 'react';
import styled from 'styled-components';

import {
  getCourtOrder,
  updateCourtOrder,
} from '@/services/court-order.service';
import { attemptLogin } from '@/services/login-check.service';
import {
  generateDateOptions,
  generateTimeOptions,
} from '@/utils/datetime.util';

function App() {
  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [dateIdx, setDateIdx] = useState<number>(0);
  const [startTimeIdx, setStartTimeIdx] = useState<number>(21); // 7:30 pm
  const [endTimeIdx, setEndTimeIdx] = useState<number>(24); // 9:00 pm
  const [courtOrder, setCourtOrder] = useState<string>('');

  // get court order on load
  useEffect(() => {
    getCourtOrder().then((res) => {
      if ('error' in res) {
        alert(`Error fetching court order: ${res.error}`);
      } else {
        setCourtOrder(res.order);
      }
    });
  }, []);

  const handleSubmit = () => {
    // for now, just log the values and update court order
    console.log({
      username,
      password,
      date: dateOptions[dateIdx].value,
      startTime: timeOptions[startTimeIdx],
      endTime: timeOptions[endTimeIdx],
      courtOrder,
    });

    updateCourtOrder(courtOrder).then((res) => {
      if ('error' in res) {
        alert(`Error updating court order: ${res.error}`);
      }
    });

    attemptLogin(username, password).then((res) => {
      console.log('Login check successful');
      if ('error' in res) {
        alert(`Login failed: ${res.error}`);
      }
    });
  };

  return (
    <PageContainer>
      <h1>Court Reservation</h1>
      <ContentContainer>
        <FormContainer>
          <div className='form-field'>
            <label htmlFor='username'>Username</label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='form-field'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='form-field'>
            <label htmlFor='date'>Date</label>
            <select
              id='date'
              value={dateIdx}
              onChange={(e) => setDateIdx(parseInt(e.target.value, 10))}
            >
              {dateOptions.map(({ label }, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className='form-field'>
            <label htmlFor='start-time'>Start Time</label>
            <select
              id='start-time'
              value={startTimeIdx}
              onChange={(e) => setStartTimeIdx(parseInt(e.target.value, 10))}
            >
              {timeOptions.map((time, i) => (
                <option key={i} value={i}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className='form-field'>
            <label htmlFor='end-time'>End Time</label>
            <select
              id='end-time'
              value={endTimeIdx}
              onChange={(e) => setEndTimeIdx(parseInt(e.target.value, 10))}
            >
              {timeOptions.map((time, i) => (
                <option key={i} value={i}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className='form-field'>
            <label htmlFor='court-order'>Court Order</label>
            <input
              id='court-order'
              type='text'
              value={courtOrder}
              onChange={(e) => setCourtOrder(e.target.value)}
            />
          </div>
          <button onClick={handleSubmit}>Submit</button>
        </FormContainer>
      </ContentContainer>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px 60px;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 10px 0;
  flex: 1;

  > * {
    flex: 1;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;

  > .form-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 5px;
    width: 100%;

    > label {
      font-weight: bold;
    }

    > input,
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
  }

  > button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
      background-color: #0056b3;
    }

    &:active {
      background-color: #004080;
    }
  }
`;

export default App;
