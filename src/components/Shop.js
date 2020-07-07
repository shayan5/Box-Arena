import React, { Component } from "react";
import axios from 'axios';
import "./Shop.css";

import ShopItem from "./ShopItem";

class Shop extends Component {
    render() {
        return (
            <div>
                <ShopItem
                    itemName={"Default Armour"}
                    itemCost={0}
                    itemImage={"default"}
                />

                <ShopItem
                    itemName={"Pirate Armour"}
                    itemCost={15}
                    itemImage={"pirate"}
                />
            </div>
        );
    }
}

export default Shop;