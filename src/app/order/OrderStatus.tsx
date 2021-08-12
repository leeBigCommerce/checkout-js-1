// Should be in own file: OrderStatus/OrderStatus.tsx
// and the only export of: OrderStatus/index.ts
import { Order } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../locale';

import OrderConfirmationSection from './OrderConfirmationSection';

const SEPA_METHOD = 'SEPA Direct Debit (via Checkout.com)';
const TEXT_ONLY_METHODS = [SEPA_METHOD];
const MANDATES_MAP: Record<string, string> = {
    'Stripe (SEPA)': 'sepa_link_text',
    'OXXO (via Checkout.com)': 'oxxo_link_text',
    'Boleto Bancário (via Checkout.com)': 'boleto_link_text',
    [SEPA_METHOD]: 'mandate_text_only',
    default: 'mandate_link_text',
};

export interface OrderStatusProps {
    supportEmail: string;
    supportPhoneNumber?: string;
    order: Order;
}

const OrderStatus: FunctionComponent<OrderStatusProps> = ({
    order,
    supportEmail,
    supportPhoneNumber,
}) => {
    const mandateProvider = `${order?.payments?.[0].description}`;
    const mandateTextId = MANDATES_MAP[mandateProvider] || MANDATES_MAP.default;
    const showMandateAsTextOnly = TEXT_ONLY_METHODS.includes(mandateProvider);

    return <OrderConfirmationSection>
        <OrderNumber orderNumber={ order.orderId } />

        <p data-test="order-confirmation-order-status-text">
            <OrderStatusMessage
                orderNumber={ order.orderId }
                orderStatus={ order.status }
                supportEmail={ supportEmail }
                supportPhoneNumber={ supportPhoneNumber }
            />
        </p>

        { showMandateAsTextOnly || !order.mandateUrl ?
            <MandateText id={ mandateTextId } mandate={ order.mandateUrl } provider={ mandateProvider } /> :
            <MandateLink id={ mandateTextId } mandate={ order.mandateUrl } provider={ mandateProvider } /> }

        { order.hasDigitalItems && <DigitalItems downloadable={ order.isDownloadable } /> }
    </OrderConfirmationSection>;
};

export default memo(OrderStatus);

// Should be in own file: OrderStatus/OrderStatusMessage.tsx
interface OrderStatusMessageProps {
    orderNumber: number;
    orderStatus: string;
    supportEmail?: string;
    supportPhoneNumber?: string;
}

const OrderStatusMessage: FunctionComponent<OrderStatusMessageProps> = ({
    orderNumber,
    orderStatus,
    supportEmail,
    supportPhoneNumber,
}) => {
    switch (orderStatus) {
    case 'MANUAL_VERIFICATION_REQUIRED':
    case 'AWAITING_PAYMENT':
        return <TranslatedHtml
            id="order_confirmation.order_pending_review_text"
        />;

    case 'PENDING':
        return <TranslatedHtml
            data={ { orderNumber, supportEmail } }
            id="order_confirmation.order_pending_status_text"
        />;

    case 'INCOMPLETE':
        return <TranslatedHtml
            data={ { orderNumber, supportEmail } }
            id="order_confirmation.order_incomplete_status_text"
        />;

    default:
        return <TranslatedHtml
            data={ { orderNumber, supportEmail, supportPhoneNumber } }
            id={ supportPhoneNumber ?
                'order_confirmation.order_with_support_number_text' :
                'order_confirmation.order_without_support_number_text' }
        />;
    }
};

// Should be in own file: OrderStatus/OrderNumber.tsx
interface OrderNumberProps { orderNumber: number; }

const OrderNumber = ({ orderNumber }: OrderNumberProps) => (
    <p data-test="order-confirmation-order-number-text">
        <TranslatedHtml
            data={ { orderNumber } }
            id="order_confirmation.order_number_text"
        />
    </p>
);

// Should be in own file: OrderStatus/MandateText.tsx
interface MandateTextProps { provider: string; mandate?: string; id: string; }

const MandateText = ({ provider, mandate = '', id }: MandateTextProps) => (
    <div data-test="order-confirmation-mandate-text-only">
        <br />
        <TranslatedString
            data={ { provider, mandate } }
            id={ 'order_confirmation.' + id }
        />
    </div>
);

// Should be in own file: OrderStatus/MandateLink.tsx
interface MandateLinkProps { provider: string; mandate: string; id: string; }

const MandateLink = ({ provider, mandate, id }: MandateLinkProps) => (
    <a data-test="order-confirmation-mandate-link-text" href={ mandate } rel="noopener noreferrer" target="_blank">
        <TranslatedString
            data={ { provider } }
            id={ 'order_confirmation.' + id }
        />
    </a>
);

// Should be in own file: OrderStatus/DigitalItems.tsx
interface DigitalItemsProps { downloadable: boolean; }

const DigitalItems = ({ downloadable }: DigitalItemsProps) => (
    <p data-test="order-confirmation-digital-items-text">
        <TranslatedHtml
            id={ downloadable ?
                'order_confirmation.order_with_downloadable_digital_items_text' :
                'order_confirmation.order_without_downloadable_digital_items_text' }
        />
    </p>
);
