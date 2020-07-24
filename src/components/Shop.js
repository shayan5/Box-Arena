import React, { Component } from "react";
import axios from 'axios';
import "./Shop.css";
import "./Footer.css"

import ShopItem from "./ShopItem";

class Shop extends Component {
    constructor(props) {
        super(props);

        this.renderIndividualItems = this.renderIndividualItems.bind(this);
        this.getShopItems = this.getShopItems.bind(this);
        this.equipItem = this.equipItem.bind(this);
        this.purchaseItem = this.purchaseItem.bind(this);
        this.getPlayerInfo = this.getPlayerInfo.bind(this);

        this.state = {
            equipped: "default",
            balance: 0, 
            unlocked: ["default"], 
            items: [], 
            message: '' 
        }
    }

    componentDidMount() {
        this.getShopItems();
        this.getPlayerInfo();
    }

    getShopItems() {
        axios.get('/items/item-shop') //TODO change to relative path
        .then((res) => {
            if (res.data) {
                this.setState({ items: res.data });
            }
        })
        .catch((err) => {
            if (err.response.data) {
                this.setState({ message: err.response.data });
            }
        }); 
    }

    getPlayerInfo() {
        const config = {
            headers: { Authorization: `Bearer ${this.props.accessToken}` }
        };
        axios.get('/players/basic-info', config) //TODO relative path
        .then((res) => {
            if (res.data) {
                this.setState({ 
                    unlocked: res.data.unlocks,
                    balance: res.data.currency,
                    equipped: res.data.armour 
                });
            }
        }).catch((err) => {
            this.setState({ message: err.response.data });
        });
    }

    renderIndividualItems(items) {
        return items.map((item, index) => {
            const purchased = this.state.unlocked.includes(item.armour);
            const equipped = this.state.equipped === item.armour;
            return (
                <ShopItem key={index}
                    itemName={item.armour}
                    itemCost={item.cost}
                    itemImage={item.armour}
                    purchased={purchased}
                    equipped={equipped}
                    canEquip={!equipped && purchased}
                    canPurchase={this.state.balance >= item.cost}
                    changeEquipment={this.equipItem}
                    purchaseEquipment={this.purchaseItem}
                />
            );
        })
    }

    purchaseItem(item) {
        const config = {
            headers: { Authorization: `Bearer ${this.props.accessToken}` }
        };
        axios.post('/players/purchase-item', //TODO relative path
            { item: item },
            config)
        .then((res) => {
            if (res.data) {
                this.setState({
                    unlocked: res.data.unlocks,
                    balance: res.data.currency
                });
            }
        })
        .catch((err) => {
            this.setState({ message: err.response.data });
        });
    }

    equipItem(item) {
        const config = {
            headers: { Authorization: `Bearer ${this.props.accessToken}` }
        };
        axios.post('/players/change-equipment', //TODO relative path
            { item: item }, 
            config)
        .then(() => {
            this.setState({ equipped: item });
        }).catch((err) => {
            this.setState({ message: err.response.data });
        });
    }

    render() {
        return (
            <div>
                {this.state.message}
                <div className="balanceDiv">
                    <h5>Welcome to the Item Shop!</h5>
                    You have: ${this.state.balance}
                </div>
                <div className="items">
                    {this.renderIndividualItems(this.state.items)}
                </div>
            </div>
        );
    }
}

export default Shop;