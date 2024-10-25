import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navigation from "./components/Navigation/Navigation";
import SpotList from "./components/Spot/SpotList";
import SpotDetails from "./components/Spot/SpotDetails";
import SpotForm from "./components/Spot/SpotForm";
import SpotManage from "./components/Spot/SpotManage";
import SpotFormUpdate from "./components/Spot/SpotFormUpdate";
import UserReviews from "./components/Review/ReviewManage";
import BookingManage from "./components/Booking/BookingManage";
import * as sessionActions from "./store/session";

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <div className="container">
      <header>
        <Navigation isLoaded={isLoaded} />
      </header>
      <main>
        {isLoaded && <Outlet />}
      </main>
    </div>

  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path:"/",
        element: <SpotList />
      },
      {
        path:"/spots/:spotId",
        element: <SpotDetails />
      },
      {
        path:"/spots/new",
        element: <SpotForm />
      },
      {
        path:"/spots/current",
        element: <SpotManage />
      },
      {
        path:"/spots/:spotId/edit",
        element: <SpotFormUpdate />
      },
      {
        path:"/reviews/current",
        element: <UserReviews />
      },
      {
        path:"/bookings/current",
        element: <BookingManage />
      },
      {
        path: "*",
        element: <h1>Page Not Found</h1>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
