import { createContext, useReducer } from "react";

export const UsersContext = createContext();

export const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return {
        users: action.payload,
      };
    case "ADD_USER":
      return {
        users: [action.payload, ...state.users],
      };
    case "UPDATE_USER":
      return {
        users: state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u,
        ),
      };
    case "REMOVE_USER":
      return {
        users: state.users.filter(
            (u) => u._id !== action.payload
        ),
      };
    default:
      return state;
  }
};

export const UsersContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    users: [],
  });

  return (
    <UsersContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
};
