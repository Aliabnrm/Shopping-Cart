import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { login } from "../services/api";
import { useNavigate } from "react-router-dom";

interface ShoppingCartProvider {
  children: React.ReactNode;
}
interface CartItem {
  id: number;
  qty: number;
}

interface ShoppingCartContext {
  handleIncreaseProductQty: (id: number) => void;
  handleDecreaseProductQty: (id: number) => void;
  getProductQty: (id: number) => number;
  handleRemoveProduct: (id: number) => void;
  handleLogin: (username: string, password: string) => void;
  handleLogOut: () => void;

  cartQty: number;
  cartItems: CartItem[];
  islogin: boolean;
}

export const ShoppingCartContext = createContext({} as ShoppingCartContext);

export const useShoppingCartContext = () => {
  return useContext(ShoppingCartContext);
};

export function SoppingCartProvider({ children }: ShoppingCartProvider) {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    "cartItems",
    []
  );

  const handleIncreaseProductQty = (id: number) => {
    setCartItems((currentItems) => {
      const selectedItem = currentItems.find((item) => item.id == id);

      if (selectedItem == null) {
        return [...currentItems, { id: id, qty: 1 }];
      } else {
        return currentItems.map((item) => {
          if (item.id == id) {
            return {
              ...item,
              qty: item.qty + 1,
            };
          } else {
            return item;
          }
        });
      }
    });
  };

  const handleDecreaseProductQty = (id: number) => {
    setCartItems((currentItems) => {
      const selectedItem = currentItems.find((item) => item.id == id);

      if (selectedItem?.qty === 1) {
        return currentItems.filter((item) => item.id !== id);
      } else {
        return currentItems.map((item) => {
          if (item.id == id) {
            return {
              ...item,
              qty: item.qty - 1,
            };
          } else {
            return item;
          }
        });
      }
    });
  };

  const getProductQty = (id: number) => {
    return cartItems.find((item) => item.id == id)?.qty || 0;
  };

  const handleRemoveProduct = (id: number) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id != id)
    );
  };

  const cartQty = cartItems.reduce((totalQty, item) => totalQty + item.qty, 0);

  const [islogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string) => {
    login(username, password).finally(() => {
      const token =
        "N2IxYjUzMzQtMDkwYi00ODE0LWIzZWQtOWI4YWRkMDlkOGI4OjY0YWNmYTc4LWJmMzEtNDQ1Zi04NDI3LTgzOGJiYjEyMWRkMg";
      localStorage.setItem("token", token);

      navigate("/");
      setIsLogin(true);
    });
  };

  const handleLogOut = () => {
    setIsLogin(false);
    navigate("/login");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLogin(true);
    }
  }, []);

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        handleIncreaseProductQty,
        handleDecreaseProductQty,
        getProductQty,
        handleRemoveProduct,
        cartQty,
        islogin,
        handleLogin,
        handleLogOut,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}