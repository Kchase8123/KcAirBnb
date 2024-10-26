import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";



function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);

    return (
        <div className="navigation-bar">
            <div className="logo">
                <NavLink to="/"><img src='/logo.png' alt="Home"/></NavLink>
            </div>

            <div className="create-spot-container">
                <span><NavLink to="/spots/new">Create a New Spot</NavLink></span>
                {isLoaded && (
                    <div className="profile-container">
                        <ProfileButton user={sessionUser}/>
                    </div>
                )}
            </div>
        </div>

    );
}

export default Navigation;
