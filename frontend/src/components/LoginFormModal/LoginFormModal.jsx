import { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const isButtonDisabled = credential.length < 4 || password.length < 6;

    const handleDemoLogin = () => {
        dispatch(sessionActions.login({credential: "demo@user.io", password: "password"}))
            .then(closeModal)
            .catch(async(res) => {
                if (res.status === 401) {
                    setErrors({credential: "The provided credentials were invalid"});
                }
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(sessionActions.login({credential, password}))
        .then(closeModal)
        .catch(async (res) => {
            if (res.status === 401) {
                setErrors({credential: "The provided credentials were invalid"});
            }
        });
    };

    return (
        <>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username or Email
                    <input
                        type ="text"
                        value={credential}
                        onChange={e => setCredential(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </label>
                {errors.credential && <p>{errors.credential}</p>}
                <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className={isButtonDisabled ? "disabled-button" : "enabled-button"}
                >
                    Log In
                </button>
                <button
                    type="button"
                    onClick={handleDemoLogin}
                >
                    Log in as Demo User
                </button>
            </form>
        </>
    );
}

export default LoginFormModal;
