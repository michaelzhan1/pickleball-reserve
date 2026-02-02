import { FormEvent, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import styled from 'styled-components';

import { attemptAuth } from '@/services/auth.service';
import { attemptLogin } from '@/services/login-check.service';
import {
  deleteReservation,
  getAllReservations,
  addReservation,
} from '@/services/reservation.service';
import { ReservationFormdata, ReservationListItem } from '@/types/reserve.type';
import {
  generateDateOptions,
  generateTimeOptions,
} from '@/utils/datetime.util';

function App() {
  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

  const [formdata, setFormdata] = useState<ReservationFormdata>({
    username: '',
    password: '',
    dateIdx: 0,
    startTimeIdx: 23, // 7:30 pm
    endTimeIdx: 26, // 9:0 pm
    courtOrder: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);

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
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();

    attemptAuth(authPassword).then((res) => {
      if ('error' in res) {
        alert(`Authentication failed: ${res.error}`);
      } else {
        setAuthPassed(true);
        document.cookie = `auth=${authPassword}; path=/; max-age=3600`; // 1 hour
      }
    });
  };

  // load court order cookie
  useEffect(() => {
    const courtOrderCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('courtOrder='));
    if (courtOrderCookie) {
      const value = decodeURIComponent(courtOrderCookie.split('=')[1] || '');
      setFormdata((prev) => ({ ...prev, courtOrder: value }));
    }
  }, []);

  // get reservations
  function refreshReservations() {
    getAllReservations().then((res) => {
      if ('error' in res) {
        alert(`Error fetching scheduled reservations: ${res.error}`);
      } else {
        const reservations = res.reservations;

        // sort reservations by date parts, then username
        reservations.sort((a, b) => {
          const dateA = new Date(
            a.date.year,
            a.date.month,
            a.date.day,
          ).getTime();
          const dateB = new Date(
            b.date.year,
            b.date.month,
            b.date.day,
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

  // set reservations on load
  useEffect(() => {
    refreshReservations();
  }, []);

  // handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formdata.endTimeIdx <= formdata.startTimeIdx) {
      alert('End time must be after start time.');
      setLoading(false);
      return;
    }

    // const loginResponse = await attemptLogin(
    //   formdata.username,
    //   formdata.password,
    // );
    // if ('error' in loginResponse) {
    //   alert(`Login failed: ${loginResponse.error}`);
    //   setLoading(false);
    //   return;
    // }
    // console.log('Login successful');

    const scheduleResponse = await addReservation({
      username: formdata.username,
      password: formdata.password,
      date: dateOptions[formdata.dateIdx].value,
      startTimeIdx: formdata.startTimeIdx,
      endTimeIdx: formdata.endTimeIdx,
      courtOrder: formdata.courtOrder,
    });
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

  // handle deleting a reservation
  const handleDelete = async (reservation: ReservationListItem) => {
    const { id, username, date } = reservation;
    if (
      !window.confirm(
        `Are you sure you want to delete the reservation for ${username} on ${date.month + 1}/${date.day}/${date.year}?`,
      )
    ) {
      return;
    }

    const deleteResponse = await deleteReservation(id);
    if ('error' in deleteResponse) {
      alert(`Error deleting reservation: ${deleteResponse.error}`);
      return;
    }
    console.log('Reservation deleted successfully');
    alert('Reservation deleted successfully!');

    // Refresh reservations after deletion
    refreshReservations();
  };

  return (
    <PageContainer>
      {!authPassed ? (
        <FormContainer
          onSubmit={handleAuthSubmit}
          style={{ maxWidth: '400px' }}
        >
          <div className='form-field'>
            <label htmlFor='auth'>Enter password:</label>
            <input
              id='auth'
              type='password'
              required
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
          </div>
          <button type='submit'>Submit</button>
        </FormContainer>
      ) : (
        <>
          <h1>Court Reservation</h1>
          <ContentContainer>
            <FormContainer onSubmit={handleSubmit}>
              <div className='form-field'>
                <label htmlFor='username'>Username</label>
                <input
                  id='username'
                  type='text'
                  required
                  value={formdata.username}
                  onChange={(e) =>
                    setFormdata((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='form-field'>
                <label htmlFor='password'>Password</label>
                <input
                  id='password'
                  type='password'
                  required
                  value={formdata.password}
                  onChange={(e) =>
                    setFormdata((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='form-field'>
                <label htmlFor='date'>Date</label>
                <select
                  id='date'
                  value={formdata.dateIdx}
                  onChange={(e) =>
                    setFormdata((prev) => ({
                      ...prev,
                      dateIdx: parseInt(e.target.value, 10),
                    }))
                  }
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
                  value={formdata.startTimeIdx}
                  onChange={(e) =>
                    setFormdata((prev) => ({
                      ...prev,
                      startTimeIdx: parseInt(e.target.value, 10),
                    }))
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
                  value={formdata.endTimeIdx}
                  onChange={(e) =>
                    setFormdata((prev) => ({
                      ...prev,
                      endTimeIdx: parseInt(e.target.value, 10),
                    }))
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
                <label htmlFor='court-order'>Court Order</label>
                <input
                  id='court-order'
                  type='text'
                  required
                  value={formdata.courtOrder}
                  onChange={(e) =>
                    setFormdata((prev) => ({
                      ...prev,
                      courtOrder: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <button type='submit' disabled={loading}>
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
                      {`${reservation.date.dayOfWeek} ${reservation.date.month + 1}/${reservation.date.day}/${reservation.date.year} `}
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

const FormContainer = styled.form`
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
