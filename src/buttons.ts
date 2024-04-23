import {Markup} from 'telegraf'

export function Buttons() {
    return Markup.keyboard(
        [
            Markup.button.callback('Привязать профиль', 'profile')
        ],
        {
            columns: 1
        }
    )
}