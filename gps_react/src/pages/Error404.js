import React from "react";
import { Link } from "react-router-dom";
export function Error404() {
  return (
    <div className="not-found">
      <span className="eyebrow">ERROR 404</span>
      <h1>No encontramos esta página</h1>
      <p>Es posible que el enlace haya cambiado.</p>
      <Link className="ui primary button" to="/admin">
        Volver al inicio
      </Link>
    </div>
  );
}
