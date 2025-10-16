


class ApiError extends Error {
  /**
   * Error object containing response status, error code, and error message
   */
  constructor(status, { error, message }) {
    super(message);
    this.status = status;
    this.code = error;
  }
}


 const baseUrl = "http://127.0.0.1:8000"; 
  // const baseUrl = "https://pony-express-jacobdietz.onrender.com";

/**
 * Processes response from GET/POST Request
 * @param {*} response 
 * @returns JSON response or error if
 */ 
const handleResponse = async (response) => {
  if (response.ok) {
    return response.status == 204 ? {} : await response.json();
  } 
  
  else {
    const error = await response.json();
    const err = new Error(error.message);
    err.status = response.status;
    throw err;
  }
};

/**
 * Asynchronously creates GET request
 * @param {*} url destination of request
 * @param {*} headers 
 * @returns value from handlResponse
 */
export const get = async (url, headers) => {
  console.log("API GET: ", baseUrl + url);
  const response = await fetch(baseUrl + url, { headers });
  return await handleResponse(response);
};


export const postLoginForm = async (url, values) => {
  const { password } = values;
  const { username } = values;

  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  //console.log(formData.keys, "        form data     ", formData.values);
  
  const response = await fetch(baseUrl + url, {
    method: "POST",
    body: formData,
  });
  return await handleResponse(response);
};


export const registrationForm = async (url, values) => {
  const { password } = values;
  const { email } = values;
  const { username } = values;

  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);

  const response = await fetch(baseUrl + url, {
    method: "POST",
    body: formData,
  });

  return await handleResponse(response);
};

/**
 * Send to Authenticated Route
 * @param {*} url 
 * @param {*} values 
 * @param {*} headers 
 * @returns 
 */
export const updateAccount = async (url, values, headers) => {
  const sanitizedValues = {
    ...values,
    username: values.username?.trim() === "" ? null : values.username,
    email: values.email?.trim() === "" ? null : values.email,
  };

  console.log("Sanitized account values:", sanitizedValues);

  const response = await fetch(baseUrl + url, {
    method: "PUT",
    body: JSON.stringify(sanitizedValues),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  return await handleResponse(response);
};

/**
 * Sent to authenticated route
 * @param {} url 
 */
export const updatePassword = async (details, headers, url = "/accounts/me/password ") => {
  const { old_password } = details;
  const { new_password } = details;

  const formData = new FormData();
  formData.append("old_password", old_password);
  formData.append("new_password", new_password);

  console.log("updating password ", headers);
  const response = await fetch(baseUrl + url, {
    method: "PUT",
    body: formData,
    headers: headers
  });

  return await handleResponse(response);
}

export const deleteAccount = async (headers, url = "/accounts/me ") => {
  console.log("Deleting account ", headers);
  const response = await fetch(baseUrl + url, {
    method: "DELETE",
    headers: headers
  });

  return await handleResponse(response);
}

export const sendMessage = async (headers, message, chatID, accountID) => {
  console.log("SENDING MESSAGE", chatID,"  ", accountID);

  const response = await fetch(baseUrl + `/chats/${chatID}/messages`, {
    method: "POST",
    body: JSON.stringify({
      "text": message,
      "account_id": accountID
    }),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    }
  });
  return await handleResponse(response);
};

export const sendEditedMessage = async (headers, message, chatID, messageID) => {
  const response = await fetch(baseUrl + `/chats/${chatID}/messages/${messageID}`, {
    method: "PUT",
    body: JSON.stringify({
      "text": message,
    }),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    }
  });
  return await handleResponse(response);
};


export const sendDeleteMessage = async (headers, chatID, messageID) => {
  const response = await fetch(baseUrl + `/chats/${chatID}/messages/${messageID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    }
  });
  return await handleResponse(response);
};


export const joinChat = async (headers, chatID, accountID) => {
  console.log("joining chat from api");
  const response = await fetch(baseUrl + `/chats/${chatID}/accounts`, {
    method: "POST",
    body: JSON.stringify({"account_id": accountID}),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    }
  });
  return await handleResponse(response);
};






export default { get, postLoginForm, registrationForm, sendMessage }