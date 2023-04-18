import Button from "../../common/components/Button";
import "./ErrorPage.scss";
import { useNavigate } from "react-router";

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div id="error-page">
            <i className="bi bi-exclamation-circle"></i>
            <h1>Something went wrong! Please try again.</h1>
            <Button role="link" type="primary" onClick={() => navigate("/")}>Try again</Button>
        </div>
    )
}

export default ErrorPage;