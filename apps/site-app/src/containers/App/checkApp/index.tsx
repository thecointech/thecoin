import React from "react";

export const checkIfInApp = async () => {
    const [show, setShow] = React.useState(false)

      setTimeout(() => {
        const box = document.querySelector('.inAppContent');
        const rect = box?.getBoundingClientRect();
          console.log("inAppContent---",box,rect);
          if (rect){
            setShow(true);
          }
      }, 1000);
      return show;
}
