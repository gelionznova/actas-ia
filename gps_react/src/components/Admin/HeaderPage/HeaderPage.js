import React from "react";
import { Button, Icon } from "semantic-ui-react";
export function HeaderPage({
  title,
  subtitle,
  btnTitle,
  btnClick,
  btnTitleTwo,
  btnClickTwo,
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div>
        {btnTitle && (
          <Button primary onClick={btnClick}>
            <Icon name="plus" />
            {btnTitle}
          </Button>
        )}
        {btnTitleTwo && <Button onClick={btnClickTwo}>{btnTitleTwo}</Button>}
      </div>
    </div>
  );
}
