import React from "react";
import { Container } from "semantic-ui-react";

import illustration from "./images/illust_flowers.svg";

import styles from './styles.module.css';


export const Decoration = () => {
    return (
        <Container className={styles.illustration}>
            <img src={illustration} />
        </Container>
    );

}

