import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { attemptAuth } from '@/services/auth.service';
import {
  getCourtOrder,
  updateCourtOrder,
} from '@/services/court-order.service';
import {
  getAllScheduledReservations,
  scheduleReservation,
} from '@/services/schedule.service';
import { ReserveInfo } from '@/types/reserve.type';
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

  const [reservations, setReservations] = useState<ReserveInfo[]>([]);

  const [authPassword, setAuthPassword] = useState<string>('');
  const [authPassed, setAuthPassed] = useState<boolean>(false);

  // load auth cookie
  useEffect(() => {
    const authCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth='));
    if (authCookie) {
      setAuthPassed(true);
    }
  }, []);

  // handle auth submit
  const handleAuthSubmit = () => {
    attemptAuth(authPassword).then((res) => {
      if ('error' in res) {
        alert(`Authentication failed: ${res.error}`);
      } else {
        setAuthPassed(true);
        document.cookie = `auth=${authPassword}; path=/; max-age=3600`; // 1 hour
      }
    });
  };

  // get court order on load
  useEffect(() => {
    getCourtOrder().then((res) => {
      if ('error' in res) {
        alert(`Error fetching court order: ${res.error}`);
      } else {
        setCourtOrder(res.order);
      }
    });
    getAllScheduledReservations().then((res) => {
      if ('error' in res) {
        alert(`Error fetching scheduled reservations: ${res.error}`);
      } else {
        setReservations(res.reservations);
      }
    });
  }, []);

  const handleSubmit = () => {
    // for now, just log the values and update court order
    const body = {
      username,
      password,
      date: dateOptions[dateIdx].value,
      startTimeIdx,
      endTimeIdx,
      courtOrder,
    };

    if (endTimeIdx <= startTimeIdx) {
      alert('End time must be after start time.');
      return;
    }

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

    scheduleReservation(body).then((res) => {
      if ('error' in res) {
        alert(`Reservation schedule failed: ${res.error}`);
      } else if (res.success) {
        alert('Reservation schedule successful!');
      } else {
        alert('Reservation schedule failed for an unknown reason.');
      }
    });

    // Refresh reservations after scheduling
    getAllScheduledReservations().then((res) => {
      if ('error' in res) {
        alert(`Error fetching reservations: ${res.error}`);
      } else {
        setReservations(res.reservations);
      }
    });
  };

  return (
    <PageContainer>
      {!authPassed ? (
        <FormContainer style={{ maxWidth: '400px' }}>
          <div className='form-field'>
            <label htmlFor='auth'>Enter password:</label>
            <input
              id='auth'
              type='password'
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
          </div>
          <button onClick={handleAuthSubmit}>Submit</button>
        </FormContainer>
      ) : (
        <>
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
                  onChange={(e) =>
                    setStartTimeIdx(parseInt(e.target.value, 10))
                  }
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
            <JobContainer>
              <h2>Scheduled Reservations</h2>
              <JobList>
                {reservations.map((reservation, idx) => (
                  <li key={idx}>
                    <strong>{reservation.username}:</strong>{' '}
                    {`${reservation.date.month + 1}/${reservation.date.date}/${reservation.date.year} `}
                    {`from ${timeOptions[reservation.startTimeIdx]} to ${timeOptions[reservation.endTimeIdx]}`}
                  </li>
                ))}
              </JobList>
            </JobContainer>
          </ContentContainer>
        </>
      )}
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

const JobContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  height: 100%;

  > * {
    flex: 0;
  }
`;

const JobList = styled.ul`
  list-style: none;
  flex: 2;
  height: 100%;
`;

export default App;
