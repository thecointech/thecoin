import React, { Component } from 'react';

// @ts-ignore -- This variable is globally available and essential
import * as THREE from 'three';

import BIRDS from './vanta.net.min.js';

class Animation extends Component {
  public myRef = React.createRef<HTMLDivElement>();
  public effect: null | BIRDS = null;

  public componentDidMount() {
    this.effect = BIRDS({
      el: this.myRef.current,
      color: 0x7aabc5,
      backgroundColor: 0xd2dbeb,
      points: 20.0,
      maxDistance: 40.0,
      spacing: 20.0,
    });
  }
  public componentWillUnmount() {
    if (this.effect) this.effect.destroy();
  }
  public render() {
    return <div ref={this.myRef}>Foreground content goes here</div>;
  }
}

export default Animation;
