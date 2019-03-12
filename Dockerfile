#
# Copyright 2019 ForgeRock AS. All Rights Reserved
#
FROM nginxinc/nginx-unprivileged

COPY dist/ /opt/www

COPY nginx.conf /etc/nginx/conf.d/default.conf
