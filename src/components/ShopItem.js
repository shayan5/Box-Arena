import React, { Component } from "react";
import "./ShopItem.css";

const defaultArmour = require('../icons/default.png');
const pirate = require('../icons/pirate.png');

const images = {
    "default": defaultArmour,
    "pirate": pirate
}

class ShopItem extends Component {
    render() {
        return (
            <div className="shopItemDiv card">
                <img className="shopItemImg" src={images[this.props.itemImage]} alt=""></img>
                <p>Item: {this.props.itemName} </p>
                <p>Cost: {this.props.itemCost} </p>
                <button>Purchase</button><button>Equip</button>
            </div>
        );
    }
}

export default ShopItem