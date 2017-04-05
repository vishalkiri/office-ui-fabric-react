import * as React from 'react';
import {
  BaseComponent,
  css,
  getId
} from '../../Utilities';
import { IRatingProps, RatingSize } from './Rating.Props';
import styles = require('./Rating.scss');

export interface IRatingState {
  rating: number;
  focusedRating: number;
}

export class Rating extends BaseComponent<IRatingProps, IRatingState> {
  public static defaultProps: IRatingProps = {
    min: 1,
    max: 5
  };

  private _id: string;
  private _labelId: string;
  private _ratingIconClassName: string;

  constructor(props: IRatingProps) {
    super(props);

    this.state = {
      rating: this._getInitialValue(props),
      focusedRating: null
    };

    this._id = getId('Rating');
    this._labelId = getId('RatingLabel');
    this._ratingIconClassName = props.icon || 'ms-Icon--FavoriteStarFill';
  }

  public componentWillReceiveProps(nextProps: IRatingProps) {
    if (typeof nextProps.rating !== 'undefined' && nextProps.rating !== this.state.rating) {
      this.setState({
        rating: this._getClampedRating(nextProps.rating)
      } as IRatingState);
    }

    this._ratingIconClassName = nextProps.icon || 'ms-Icon--FavoriteStarFill';
  }

  public render() {
    let stars: JSX.Element[] = [];
    for (let i = this.props.min; i <= this.props.max; ++i) {
      stars.push(this._renderStar(i));
    }

    let ratingContainer: JSX.Element;

    if (this.props.aggregate) {
      ratingContainer = <div className={ css('ms-Rating-container', styles.container) } role='img' alt={ this.props.rating.toString() } aria-labelledby={ `${this._labelId}-${this.props.rating}` }>
        { this._getLabel(this.props.rating) }
        { stars }
      </div>;
    } else {
      ratingContainer = <div className={ css('ms-Rating-container', styles.container) } role='radiogroup' aria-labelledby={ this.props.ariaLabelId }>
        { stars }
      </div>;
    }

    return <div className={ css('ms-Rating', this.props.className, {
      ['ms-Rating--large ' + styles.rootIsLarge]: this.props.size === RatingSize.Large
    }) } role='application'>
      { ratingContainer }
    </div>;
  }

  private _renderStar(rating: number): JSX.Element {
    const inputId = `${this._id}-${rating}`;
    const flooredRating = Math.floor(this.state.rating);
    const starSize = this.props.aggregate && rating > this.state.rating && rating - 1 < this.state.rating ? this.state.rating - flooredRating : 1;

    return <div className={ css('ms-Rating-star', styles.star, {
      ['is-selected ' + styles.starIsSelected]: rating <= this.state.rating,
      ['is-inFocus ' + styles.starIsInFocus]: rating === this.state.focusedRating,
      ['is-disabled ' + styles.starIsDisabled]: !this.props.aggregate && this.props.disabled,
      ['is-aggregate ' + styles.starIsAggregate]: this.props.aggregate
    }) } key={ rating }>
      { !this.props.aggregate &&
        <input
          className={ css('ms-Rating-input', styles.input) }
          type='radio'
          name={ this._id }
          id={ inputId }
          value={ rating }
          aria-labelledby={ `${this._labelId}-${rating}` }
          disabled={ this.props.disabled }
          checked={ rating === this.state.rating }
          onChange={ this._onChange.bind(this, rating) }
          onFocus={ this._onFocus.bind(this, rating) }
          onBlur={ this._onBlur.bind(this, rating) }
        />
      }
      <label className={ css('ms-Rating-label', styles.label) } htmlFor={ inputId }>
        { !this.props.aggregate && this._getLabel(rating) }
        { this._getIcon(starSize) }
      </label>
    </div>;
  }

  private _onFocus(value: number, ev: React.FocusEvent<HTMLElement>): void {
    this.setState({
      focusedRating: value
    } as IRatingState);
  }

  private _onBlur(option: number, ev: React.FocusEvent<HTMLElement>): void {
    this.setState({
      focusedRating: null
    } as IRatingState);
  }

  private _onChange(rating: number, evt: React.FormEvent<HTMLInputElement>) {
    this.setState({
      rating: rating
    } as IRatingState);

    const { onChanged } = this.props;
    if (onChanged) {
      onChanged(rating);
    }
  }

  private _getLabel(rating: number): JSX.Element {
    const text = this.props.ariaLabelIcon || 'Star';

    return (
      <span
        id={ `${this._labelId}-${rating}` }
        className={ css('ms-Rating-labelText', styles.labelText) }
      >
        { `${rating} ${text}` }
      </span>
    );
  }

  private _getIcon(starSize?: number): JSX.Element {
    if (starSize && starSize < 1) {
      return (
        <span className={ css('ms-Rating-partialStarContainer', styles.partialStarContainer, 'ms-Icon', this.props.icon || 'ms-Icon--FavoriteStarFill') } >
          <i className={ css('ms-Rating-star', styles.star,
            'is-selected ' + styles.starIsSelected,
            'ms-Rating-partialStar', styles.partialStar, 'ms-Icon',
            this._ratingIconClassName) }
            style={ { width: starSize * 100 + '%' } } />
        </span>);
    } else {
      return <i className={ css('ms-Icon', this._ratingIconClassName) } />;
    }
  }

  private _getInitialValue(props: IRatingProps) {
    if (typeof props.rating === 'undefined') {
      return props.min;
    }

    if (props.rating === null) {
      return null;
    }

    return this._getClampedRating(props.rating);
  }

  private _getClampedRating(rating: number): number {
    if (!this.props.aggregate) {
      rating = Math.floor(rating);
    }

    return Math.min(Math.max(rating, this.props.min), this.props.max);
  }
}