# Copyright (c) 2020 ForgeRock. All rights reserved.
#
# This software may be modified and distributed under the terms
# of the MIT license. See the LICENSE file for details.

FROM nginxinc/nginx-unprivileged

COPY dist/ /opt/www

COPY nginx.conf /etc/nginx/conf.d/default.conf
