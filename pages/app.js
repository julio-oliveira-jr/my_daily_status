import React, { useEffect } from 'react';
import auth0 from '../lib/auth0';
import router from 'next/router';
import { db } from '../lib/db';
import { distance } from '../lib/geo';

export default function App(props) {
  useEffect(() => {
    if (!props.isAuth) {
      router.push('/');
    } else if (props.forceCreate) {
      router.push('/create-status');
    }
  }, []);

  if (!props.isAuth || props.forceCreate) {
    return null;
  }

  return (
    <div>
      <h1 className='py-4 px-4 rounded bg-black font-bold shadow-xl text-center mx-auto text-white'>Status próximos a você</h1>
      <table>
        {props.checkins.map(checkin => (
          <tr className='py-5 px-5 rounded bg-pink-800 font-bold shadow-xl text-center mx-auto text-white'>
            <td>{checkin.id === props.user.sub && 'Seu Status'}</td>
            <td>{JSON.stringify(`Latitude: ${checkin.coords.lat.toFixed(2)} e Longitude: ${checkin.coords.long.toFixed(2)}`)}</td>
            <td>{`Status: ${checkin.status}`}</td>
            <td>{`Distância até você: ${checkin.distance} km`}</td>

          </tr>
      ))}
      </table>
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const session = await auth0.getSession(req);
  const today = new Date();
  const currentDate = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
  if (session) {
    const todaysCheckin = await db
      .collection('markers')
      .doc(currentDate)
      .collection('checks')
      .doc(session.user.sub)
      .get()

    const todaysData = todaysCheckin.data();
    let forceCreate = true;
    if (todaysData) {
      forceCreate = false;
      const checkins = await db
        .collection('markers')
        .doc(currentDate)
        .collection('checks')
        .near({
          center: todaysData.coordinates,
          radius: 100
        })
        .get()
      const checkinsList = [];
      checkins.docs.forEach(doc => {
        checkinsList.push({
          id: doc.id,
          status: doc.data().status,
          coords: {
            lat: doc.data().coordinates.latitude,
            long: doc.data().coordinates.longitude
          },
          distance: distance(
                      todaysData.coordinates.latitude, 
                      todaysData.coordinates.longitude, 
                      doc.data().coordinates.latitude, 
                      doc.data().coordinates.longitude 
                    ).toFixed(2)
        })
      })
      return {
        props: {
          isAuth: true,
          user: session.user,
          forceCreate: false,
          checkins: checkinsList
        }
      }
    }

    return {
      props: {
        isAuth: true,
        user: session.user,
        forceCreate
      }
    }
  }

  return {
    props: {
      user: {
        isAuth: false,
        user: {},
      }
    }
  }
}
