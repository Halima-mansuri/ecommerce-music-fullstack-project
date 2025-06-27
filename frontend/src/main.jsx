import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; 
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { TrashProvider } from './context/TrashContext';

import App from "./App.jsx";
import theme from './theme'; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <AuthProvider>
            <CartProvider theme={theme}>
              <WishlistProvider>
                <TrashProvider>
                  <App />
                </TrashProvider>
              </WishlistProvider>
            </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
