import { IoAlertCircle } from "react-icons/io5";

const ErrorMessage = ({ message }) => (
  <div className="error-box" role="alert">
    <IoAlertCircle className="error-icon" />
     {message}
  </div>
);

export default ErrorMessage;
