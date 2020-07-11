import React, { Component } from "react";
import "./ShopItem.css";

const defaultArmour = require('../icons/default.png');
const pirate = require('../icons/pirate.png');
const ninja = require('../icons/ninja.png');
const alien = require('../icons/alien.png');
const astronaut = require('../icons/astronaut.png');
const mummy = require('../icons/mummy.png');
const robot = require('../icons/robot.png');
const spy = require('../icons/spy.png');
const wrestler = require('../icons/wrestler.png');

const images = {
    "default": defaultArmour,
    "pirate": pirate,
    "ninja": ninja,
    "alien": alien,
    "astronaut": astronaut,
    "mummy": mummy,
    "robot": robot,
    "spy": spy,
    "wrestler": wrestler
}

class ShopItem extends Component {
    constructor(props) {
        super(props);

        this.renderButton = this.renderButton.bind(this);
        this.handleChangeEquipment = this.handleChangeEquipment.bind(this);
        this.handlePurchaseEquipment = this.handlePurchaseEquipment.bind(this);
    }

    handleChangeEquipment() {
        this.props.changeEquipment(this.props.itemName);
    }

    handlePurchaseEquipment() {
        this.props.purchaseEquipment(this.props.itemName);
    }

    renderButton() {
        if (this.props.purchased) {
            return (
                <button 
                    onClick={this.handleChangeEquipment} 
                    disabled={!this.props.canEquip}>
                    {this.props.equipped? "Equipped" : "Equip"}
                </button>
            );
        } else {
            return (
                <button 
                    onClick={this.handlePurchaseEquipment} 
                    disabled={this.props.purchased || !this.props.canPurchase}>
                    {"Purchase"}
                </button>
            );
        }
    }

    render() {
        return (
            <div className="shopItemDiv card">
                <img className="shopItemImg" src={images[this.props.itemImage]} alt=""></img>
                <p>Item: {this.props.itemName} </p>
                <p>Cost: {this.props.itemCost} </p>
                {this.renderButton()}
            </div>
        );
    }
}

export default ShopItem