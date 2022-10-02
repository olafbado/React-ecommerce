import React from 'react'
import { Markup } from 'interweave';
import { getDetails } from '../queries/queries';
import { graphql } from '@apollo/client/react/hoc';
import { Attributes, Button, Slider } from '.'

class ProductDetails extends React.Component {

    constructor() {
        super()
        this.state = {
            index: 0,
            selectedOptions: {},
            setChangedAttributes: []
        }
        
    }

    componentDidUpdate = (previousProps, previousState) => {
        if (previousProps.data !== this.props.data) {
            this.setDefaultAttributes(this.props)
        }
    }

    variantChange = (e) => {
        const target = e.target
        const selectedOptions = this.state.selectedOptions
        const changedAttribute = selectedOptions.find(element => element.attribute === target.name)
        changedAttribute.value = target.value

        const changed = this.state.setChangedAttributes
        let x = changed.find(item => {
            let result = item.attribute === changedAttribute.attribute
            return result
        })
        if (!x) {
            this.setState(prevState=>({
                setChangedAttributes: [...prevState.setChangedAttributes, changedAttribute]
            }))
        } else {
            this.setState(prevState=>({
                setChangedAttributes: prevState.setChangedAttributes.map(el => el.attribute === x.attribute ? {...el, value: target.value} : el)
            }))
        }

        this.setState({
            selectedVariant: changedAttribute
        })
    }

    changeImg = (index) => {
        this.setState({
            index: index
        })
    }

    setDefaultAttributes (product) {
        console.log(product)
        if (!product.data.loading && product.data.product) {
            if (this.state.setChangedAttributes.length >= 1) {

                const selectedAttributes = product.data.product.attributes.map(p => {
                    const changedAttribute = this.state.setChangedAttributes.find(o => o.attribute === p.id)
                    return {
                        attribute: p.id,
                        value: changedAttribute ? changedAttribute.value : p.items[0].value
                    } 
                } )
            this.setState({
                selectedOptions: selectedAttributes
            })

            } else {
                const selectedAttributes = product.data.product.attributes.map(p => {
                        return {
                            attribute: p.id,
                            value: p.items[0].value
                        }                
                } )
                this.setState({
                    selectedOptions: selectedAttributes
                })
            }
        }
    }

    displayDetails = () => {
        const { index } = this.state
        const { product } = this.props.data
        const { currency } = this.props
        if (product) {
            return (
                <>
                    <div className='product-details-images'>
                        {product.gallery.map((img, index) => {
                            return (
                                <img onClick={() => this.changeImg(index)} key={index} src={img} />
                            )
                        })}
                    </div>
                    <div className='product-details-main'>
                        <div className='details-slider'>
                            <img className='product-details-image' src={product.gallery[index]}/>
                            {product.gallery.length > 1 
                            ?
                            <Slider 
                                index={index}
                                changeImg={this.changeImg}
                                galleryLength={product.gallery.length}
                                place='details'
                            />
                            :
                            null}
                        </div>
                        <div className='product-details-details'>
                            <p className='details-brand'>{product.brand}</p>
                            <p className='details-name'>{product.name}</p>
                            <Attributes
                                selectedOptions={this.state.selectedOptions}
                                attributes={product.attributes}
                                variantChange={this.variantChange}
                                place={'details'}
                            />
                            <p className='details-price'>PRICE:</p>
                            <p className='details-amount'>{this.props.currency}{this.props.findAmount(product, currency)}</p>
                            <Button
                                disabled={product.inStock ? "" : true}
                                onClick={() => this.props.handlerAddToCart({...product, selectedOptions : this.state.selectedOptions})}
                                weight={'600'}
                                size={'16px'}
                                color={product.inStock ? '#FFFFFF' : '#8D8F9A'}
                                border={'none'}
                                width={'100%'}
                                height={'52px'}
                                bg={product.inStock ? 'rgba(94, 206, 123, 1)' : '#eeeeee'}
                            >
                                {product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
                            </Button>
                            <div className='product-details-description'>
                                <Markup content={product.description}/>
                            </div>
                        </div>
                    </div>
                </>
            )
        } else {
            return (
                <div>Product not found...</div>
            )
        }
    }
    
    render() {
        return (
            <div className='product-details'>
                {this.displayDetails()}
            </div>
            
        )
    }
}

export default graphql(getDetails, {
    options: (props) => {
        return {
            variables: {
                id: window.location.pathname.split('/')[1]
            },
            fetchPolicy: "no-cache"
        }
    }
})(ProductDetails)