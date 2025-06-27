import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import styled from 'styled-components';

import { attemptAuth } from '@/services/auth.service';
import {
  getCourtOrder,
  updateCourtOrder,
} from '@/services/court-order.service';
import { attemptLogin } from '@/services/login-check.service';
import {
  deleteScheduledReservation,
  getAllScheduledReservations,
  scheduleReservation,
} from '@/services/schedule.service';
import { ReserveInfo } from '@/types/reserve.type';
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
  const [startTimeIdx, setStartTimeIdx] = useState<number>(23); // 7:30 pm
  const [endTimeIdx, setEndTimeIdx] = useState<number>(26); // 9:00 pm
  const [courtOrder, setCourtOrder] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
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

  function refreshReservations() {
    getAllScheduledReservations().then((res) => {
      if ('error' in res) {
        alert(`Error fetching scheduled reservations: ${res.error}`);
      } else {
        const reservations = res.reservations;

        // sort reservations by date parts, then username
        reservations.sort((a, b) => {
          const dateA = new Date(
            a.date.year,
            a.date.month,
            a.date.date,
          ).getTime();
          const dateB = new Date(
            b.date.year,
            b.date.month,
            b.date.date,
          ).getTime();

          if (dateA !== dateB) {
            return dateA - dateB;
          }
          return a.username.localeCompare(b.username);
        });

        setReservations(reservations);
      }
    });
  }

  // get court order on load
  useEffect(() => {
    getCourtOrder().then((res) => {
      if ('error' in res) {
        alert(`Error fetching court order: ${res.error}`);
      } else {
        setCourtOrder(res.order);
      }
    });
    refreshReservations();
  }, []);

  const handleSubmit = async () => {
    if (!username || !password) {
      alert('Username and password are required.');
      return;
    }

    setLoading(true);

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
      setLoading(false);
      return;
    }

    const courtOrderResponse = await updateCourtOrder(courtOrder);
    if ('error' in courtOrderResponse) {
      alert(`Error updating court order: ${courtOrderResponse.error}`);
      setLoading(false);
      return;
    }

    const loginResponse = await attemptLogin(username, password);
    if ('error' in loginResponse) {
      alert(`Login failed: ${loginResponse.error}`);
      setLoading(false);
      return;
    }
    console.log('Login successful');

    const scheduleResponse = await scheduleReservation(body);
    if ('error' in scheduleResponse) {
      alert(`Reservation schedule failed: ${scheduleResponse.error}`);
      setLoading(false);
      return;
    }
    console.log('Reservation scheduled successfully');
    alert('Reservation scheduled successfully!');

    // Refresh reservations after scheduling
    refreshReservations();
    setLoading(false);
  };

  const handleDelete = async (reservation: ReserveInfo) => {
    const { username, date } = reservation;
    if (
      !window.confirm(
        `Are you sure you want to delete the reservation for ${username} on ${date.month + 1}/${date.date}/${date.year}?`,
      )
    ) {
      return;
    }

    const deleteResponse = await deleteScheduledReservation({
      username,
      date,
    });
    if ('error' in deleteResponse) {
      alert(`Error deleting reservation: ${deleteResponse.error}`);
      return;
    }
    console.log('Reservation deleted successfully');

    // Refresh reservations after deletion
    refreshReservations();
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
              <div>
                <button onClick={handleSubmit} disabled={loading}>
                  Submit
                </button>
                {loading && (
                  <svg viewBox='0 0 100 100'>
                    <circle className='ring' cx='50' cy='50' r='40' />
                  </svg>
                )}
              </div>
            </FormContainer>
            <JobContainer>
              <h2>Scheduled Reservations</h2>
              <JobList>
                {reservations.map((reservation, idx) => (
                  <li key={idx}>
                    <span>
                      <strong>{reservation.username}:</strong>{' '}
                      {`${reservation.date.dayString} ${reservation.date.month + 1}/${reservation.date.date}/${reservation.date.year} `}
                      {`from ${timeOptions[reservation.startTimeIdx]} to ${timeOptions[reservation.endTimeIdx]}`}
                    </span>
                    <button onClick={() => handleDelete(reservation)}>
                      <FaTrash />
                    </button>
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

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
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

  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:disabled {
      cursor: not-allowed;
      background-color: #ccc;
    }

    &:hover:not(:disabled) {
      background-color: #0056b3;
    }

    &:active {
      background-color: #004080;
    }
  }

  > div {
    display: flex;
    align-items: center;
    gap: 20px;

    > svg {
      width: 30px;
      height: 30px;

      .ring {
        fill: none;
        stroke: #a0a0a0;
        stroke-width: 9;
        stroke-linecap: round;
        stroke-dasharray: 90;
        stroke-dashoffset: 0;
        animation: rotate 1s linear infinite;
        transform-origin: 50% 50%;
      }
    }
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
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
  padding: 0;
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  > li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;

    > button {
      background-color: transparent;
      border: none;
      cursor: pointer;
      color: #dc3545;
      font-size: 16px;

      :hover {
        color: #c82333;
      }
    }
  }
`;

export default App;
