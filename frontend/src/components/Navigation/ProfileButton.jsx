import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import * as sessionActions from "../../store/session";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import { NavLink, useNavigate } from "react-router-dom";

function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();
    const navigate = useNavigate();

    //Toggle menu visibility and stop event propogation
    const toggleMenu = (e) => {
        e.stopPropagation(); //Keep from bulbbling up to document and triggering closeMenu
        setShowMenu(!showMenu);
    };

    //Effect to handle closing the menu when clicking outside of it
    useEffect(() => {
        if (!showMenu) return;

        //Close menu if clicking outside of it
        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)){
                setShowMenu(false);
            }
        };

        document.addEventListener("click", closeMenu);

        //Cleanup the event listener on component unmount or showMenu change
        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    const closeMenu = () => setShowMenu(false);

    //Logout handler
    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
        closeMenu();
        navigate("/");
    };

    //CSS class for toggling dropdown visibility
    const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

    return ( 
        <div style={{position: "relative"}}> {/*Container for relative positioning*/}
            <button onClick={toggleMenu}>
                <FaUserCircle />
            </button>
            <ul className={ulClassName} ref={ulRef}>
                {user ? (
                    <>
                        <li>Hello, {user.username}</li>
                        <li>{user.email}</li>
                        <li>
                            <NavLink to="/spots/current">Manage Spots</NavLink>
                        </li>
                        <li>
                            <NavLink to="/reviews/current">Manage Reviews</NavLink>
                        </li>
                        <li>
                            <NavLink to="/bookings/current">Manage Bookings</NavLink>
                        </li>
                        <li>
                            <button onClick={logout}>Log Out</button>
                        </li>
                    </>
                ) : (
                    <>
                        <OpenModalMenuItem
                            itemText="Log In"
                            onItemClick={closeMenu}
                            modalComponent={<LoginFormModal />}
                        />
                        
                        <OpenModalMenuItem
                            itemText="Sign Up"
                            onItemClick={closeMenu}
                            modalComponent={<SignupFormModal />}
                        />
                    </>
                )}
            </ul>
        </div>

    );
}

export default ProfileButton;